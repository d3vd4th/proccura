from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Tuple, Optional

from app.models.user import User
from app.models.tenant import Tenant
from app.models.tenant_user import TenantUser
from app.core.security import verify_password, create_access_token, decode_token, create_refresh_token
from jose import JWTError


def check_email_for_tenants(db: Session, email: str) -> Tuple[bool, bool, List[dict]]:
   
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not user.is_active:
        return False, False, []
    
    if user.is_super_admin:
        tenants = []
    else:
        tenants = (
            db.query(Tenant)
            .join(TenantUser, TenantUser.tenant_id == Tenant.id)
            .filter(TenantUser.user_id == user.id)
            .filter(Tenant.is_active == True)
            .all()
        )
    
    tenant_list = [
        {"id": t.id, "name": t.name, "logo_url": t.logo_url}
        for t in tenants
    ]
    
    return True, user.is_super_admin, tenant_list


def authenticate_user(db: Session, email: str, password: str, tenant_id: Optional[str] = None) -> User:
    """
    Authenticate user with email and password.
    For super admins, tenant_id is optional.
    For regular users, tenant_id is required.
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Super admin handling
    if user.is_super_admin:
        if tenant_id:
            # Super admin selected a specific tenant to "act as"
            tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.is_active == True).first()
            if not tenant:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Organization not found"
                )
            user.tenant_id = tenant_id
            # Super admin doesn't need a role - they have full access
            user.role_id = None
        else:
            # Super admin without tenant context (platform-level access)
            user.tenant_id = None
            user.role_id = None
        return user
    
    # Regular user - tenant_id is required
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization selection is required"
        )
    
    # Get tenant_user for the selected tenant
    tenant_user = db.query(TenantUser).filter(
        TenantUser.user_id == user.id,
        TenantUser.tenant_id == tenant_id
    ).first()

    if not tenant_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this organization"
        )

    user.tenant_id = tenant_user.tenant_id
    user.role_id = tenant_user.role_id
    return user


def issue_tokens(user: User):
    """
    Issue access and refresh tokens.
    Tokens contain only user_id and is_super_admin.
    Tenant context is managed via X-Tenant-ID header.
    """
    access_token = create_access_token(
        subject=user.id,
        is_super_admin=user.is_super_admin
    )

    refresh_token = create_refresh_token(subject=user.id)

    return access_token, refresh_token


def refresh_access_token(db: Session, refresh_token: str):
    """
    Refresh access token.
    Returns a new access token with same user info.
    """
    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    access_token = create_access_token(
        subject=user.id,
        is_super_admin=user.is_super_admin
    )

    return access_token