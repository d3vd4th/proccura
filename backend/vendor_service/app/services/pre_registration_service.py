from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.invitation import Invitation
from app.models.vendor_pre_registration import VendorPreRegistration
from app.schemas.invitation import VendorPreRegistrationCreate
from app.services.invitation_service import InvitationService


class PreRegistrationService:
    @staticmethod
    def verify_token(db: Session, token: str) -> Invitation:
        """Verify an invitation token and return the invitation."""
        return InvitationService.verify_invitation_token(db, token)

    @staticmethod
    def submit_pre_registration(
        db: Session,
        token: str,
        registration_data: VendorPreRegistrationCreate,
    ) -> VendorPreRegistration:
        """Submit vendor pre-registration using an invitation token."""

        # Verify the token first
        invitation = InvitationService.verify_invitation_token(db, token)

        # Check if already registered with this invitation
        existing = db.query(VendorPreRegistration).filter(
            VendorPreRegistration.invitation_id == invitation.id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration has already been submitted for this invitation"
            )

        # Create pre-registration record
        pre_registration = VendorPreRegistration(
            invitation_id=invitation.id,
            tenant_id=invitation.tenant_id,
            business_name=registration_data.business_name,
            contact_person=registration_data.contact_person,
            email=registration_data.email,
            phone=registration_data.phone,
            address_line1=registration_data.address_line1,
            address_line2=registration_data.address_line2,
            city=registration_data.city,
            state=registration_data.state,
            postal_code=registration_data.postal_code,
            country=registration_data.country,
            gst_number=registration_data.gst_number,
            pan_number=registration_data.pan_number,
            business_type=registration_data.business_type,
            products_services=registration_data.products_services,
        )

        db.add(pre_registration)

        # Update invitation status
        invitation.status = "PRE_REGISTERED"

        db.commit()
        db.refresh(pre_registration)

        return pre_registration
