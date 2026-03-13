"""
Internal API endpoints for service-to-service communication.
These endpoints are NOT exposed to external clients and should only be accessed by trusted services.
"""
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import secrets
import logging

from app.models.user import User
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.permission import Permission
from app.models.tenant_user import TenantUser, TenantUserStatus, UserType
from app.core.security import hash_password
from app.core.config import settings
from app.api.deps import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


# --- Auth dependency for internal endpoints ---

def verify_internal_key(x_internal_key: str = Header(...)):
    """Verify the internal API key for service-to-service calls."""
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid internal API key")


# --- Schemas ---

class TenantAccessResponse(BaseModel):
    role_id: Optional[str] = None
    tenant_id: str
    user_id: str


class InternalUserCreateRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: Optional[str] = None
    tenant_id: str
    user_type: str = "VENDOR"


class InternalUserCreateResponse(BaseModel):
    user_id: str
    email: str
    temp_password: Optional[str] = None
    is_new_user: bool


# --- Endpoints ---

@router.get("/roles/{role_id}/permissions", response_model=list[str])
def get_role_permissions(
    role_id: str,
    db: Session = Depends(get_db),
):
    """
    Internal endpoint for API Gateway to fetch role permissions.
    Returns a list of permission codes for the given role.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    permissions = (
        db.query(Permission.code)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role_id == role_id)
        .all()
    )
    
    return [p.code for p in permissions]


@router.get("/users/{user_id}/tenants/{tenant_id}", response_model=TenantAccessResponse)
def check_user_tenant_access(
    user_id: str,
    tenant_id: str,
    db: Session = Depends(get_db),
):
    """
    Internal endpoint for API Gateway to validate user's access to a tenant.
    """
    tenant_user = db.query(TenantUser).filter(
        TenantUser.user_id == user_id,
        TenantUser.tenant_id == tenant_id
    ).first()
    
    if not tenant_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have access to this tenant"
        )
    
    return TenantAccessResponse(
        role_id=tenant_user.role_id,
        tenant_id=tenant_user.tenant_id,
        user_id=tenant_user.user_id
    )


@router.post(
    "/users",
    response_model=InternalUserCreateResponse,
    dependencies=[Depends(verify_internal_key)],
)
def create_internal_user(
    payload: InternalUserCreateRequest,
    db: Session = Depends(get_db),
):
    """
    Internal endpoint for vendor service to provision vendor users.
    Creates a User + TenantUser with the specified user_type.
    Auto-creates a 'Vendor' role if one doesn't exist in the tenant.
    """
    # Determine user_type enum
    user_type = UserType.VENDOR if payload.user_type == "VENDOR" else UserType.INTERNAL

    # Find or create the vendor role
    vendor_role = (
        db.query(Role)
        .filter(Role.name == "Vendor", Role.tenant_id == payload.tenant_id)
        .first()
    )
    if not vendor_role:
        vendor_role = Role(
            name="Vendor",
            description="Auto-created role for vendor portal users",
            tenant_id=payload.tenant_id,
        )
        db.add(vendor_role)
        db.flush()
        logger.info(f"Auto-created 'Vendor' role for tenant {payload.tenant_id}")

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == payload.email).first()
    temp_password = None
    is_new_user = False

    if existing_user:
        user = existing_user
    else:
        # Create a new user with a temp password
        temp_password = secrets.token_urlsafe(12)
        user = User(
            email=payload.email,
            first_name=payload.first_name,
            last_name=payload.last_name,
            password_hash=hash_password(temp_password),
            is_active=True,
        )
        db.add(user)
        db.flush()
        is_new_user = True

        logger.info(f"Created new user {user.email} (id: {user.id})")
        # Dev mode: print temp password
        print(f"\n{'='*60}")
        print(f"🔑 VENDOR USER CREATED (Dev Mode)")
        print(f"   Email: {user.email}")
        print(f"   Temp Password: {temp_password}")
        print(f"{'='*60}\n")

    # Check if already a member of this tenant
    existing_tu = (
        db.query(TenantUser)
        .filter(
            TenantUser.user_id == user.id,
            TenantUser.tenant_id == payload.tenant_id,
        )
        .first()
    )

    if existing_tu:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists in this tenant"
        )

    # Create TenantUser
    tenant_user = TenantUser(
        user_id=user.id,
        tenant_id=payload.tenant_id,
        role_id=vendor_role.id,
        status=TenantUserStatus.ACTIVE,
        user_type=user_type,
    )
    db.add(tenant_user)
    db.commit()

    logger.info(f"Added user {user.email} to tenant {payload.tenant_id} as {user_type.value}")

    return InternalUserCreateResponse(
        user_id=user.id,
        email=user.email,
        temp_password=temp_password,
        is_new_user=is_new_user,
    )
