"""
Internal API endpoints for service-to-service communication.
These endpoints are NOT exposed to external clients and should only be accessed by trusted services.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.permission import Permission
from app.models.tenant_user import TenantUser
from app.api.deps import get_db

router = APIRouter()


class TenantAccessResponse(BaseModel):
    role_id: Optional[str] = None
    tenant_id: str
    user_id: str


@router.get("/roles/{role_id}/permissions", response_model=list[str])
def get_role_permissions(
    role_id: str,
    db: Session = Depends(get_db),
):
    """
    Internal endpoint for API Gateway to fetch role permissions.
    Returns a list of permission codes for the given role.
    
    This endpoint is NOT authenticated - it should only be accessible
    from internal services (API Gateway).
    """
    # Verify role exists
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Get all permission codes for this role
    permissions = (
        db.query(Permission.code)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role_id == role_id)
        .all()
    )
    
    # Return list of permission codes
    return [p.code for p in permissions]


@router.get("/users/{user_id}/tenants/{tenant_id}", response_model=TenantAccessResponse)
def check_user_tenant_access(
    user_id: str,
    tenant_id: str,
    db: Session = Depends(get_db),
):
    """
    Internal endpoint for API Gateway to validate user's access to a tenant.
    Returns the user's role_id for that tenant if they have access.
    
    This endpoint is NOT authenticated - it should only be accessible
    from internal services (API Gateway).
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
