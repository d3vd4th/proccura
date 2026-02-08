"""
Internal API endpoints for service-to-service communication.
These endpoints are NOT exposed to external clients and should only be accessed by trusted services.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.permission import Permission
from app.api.deps import get_db

router = APIRouter()


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
