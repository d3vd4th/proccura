import httpx
import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.vendor_user import VendorUser
from app.models.vendor_registration import VendorRegistration
from app.schemas.vendor_user import VendorUserCreate
from app.core.config import settings

logger = logging.getLogger(__name__)


class VendorUserService:

    @staticmethod
    def provision_user(
        db: Session,
        registration_id: str,
        tenant_id: str,
        user_data: VendorUserCreate,
    ) -> VendorUser:
        """
        Provision a vendor user:
        1. Call auth service internal endpoint to create user + tenant membership
        2. Store VendorUser record linking auth user to vendor registration
        """
        # Verify the registration exists
        registration = db.query(VendorRegistration).filter(
            VendorRegistration.id == registration_id,
            VendorRegistration.tenant_id == tenant_id,
        ).first()

        if not registration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor registration not found",
            )

        # Check if user already exists for this registration
        existing = db.query(VendorUser).filter(
            VendorUser.email == user_data.email,
            VendorUser.registration_id == registration_id,
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User {user_data.email} already provisioned for this registration",
            )

        # Call auth service to create the user
        try:
            response = httpx.post(
                f"{settings.AUTH_SERVICE_URL}/api/v1/internal/users",
                json={
                    "email": user_data.email,
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name,
                    "tenant_id": tenant_id,
                    "user_type": "VENDOR",
                },
                headers={"X-Internal-Key": settings.INTERNAL_API_KEY},
                timeout=10.0,
            )

            if response.status_code == 409:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User already exists in this tenant",
                )

            if response.status_code != 200:
                logger.error(f"Auth service error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to provision user in auth service",
                )

            auth_data = response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to reach auth service: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Auth service unavailable",
            )

        # Create VendorUser record
        vendor_user = VendorUser(
            registration_id=registration_id,
            tenant_id=tenant_id,
            auth_user_id=auth_data["user_id"],
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            is_primary=user_data.is_primary,
        )
        db.add(vendor_user)
        db.commit()
        db.refresh(vendor_user)

        logger.info(f"Provisioned vendor user {user_data.email} for registration {registration_id}")

        return vendor_user

    @staticmethod
    def list_users(
        db: Session,
        registration_id: str,
        tenant_id: str,
    ) -> list[VendorUser]:
        """List all vendor users for a registration."""
        return (
            db.query(VendorUser)
            .filter(
                VendorUser.registration_id == registration_id,
                VendorUser.tenant_id == tenant_id,
            )
            .order_by(VendorUser.created_at.desc())
            .all()
        )

    @staticmethod
    def delete_user(
        db: Session,
        registration_id: str,
        user_id: str,
        tenant_id: str,
    ) -> bool:
        """Delete a vendor user."""
        vendor_user = db.query(VendorUser).filter(
            VendorUser.id == user_id,
            VendorUser.registration_id == registration_id,
            VendorUser.tenant_id == tenant_id,
        ).first()

        if not vendor_user:
            return False

        db.delete(vendor_user)
        db.commit()
        return True
