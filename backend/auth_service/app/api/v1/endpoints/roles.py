from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    RolePermissionUpdate,
)
from app.services.role_service import (
    create_role,
    list_roles,
    update_role,
    replace_role_permissions,
)
from app.dependencies.tenant import get_current_tenant
from app.dependencies.permissions import require_permission
from app.models.role import Role    
from app.api.deps import get_db  


router = APIRouter()  


@router.post(
    "",
    response_model=RoleResponse,
    status_code=201,
    dependencies=[Depends(require_permission("role.create"))],
)
def create_role_api(
    payload: RoleCreate,
    tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db),
):
    return create_role(db, tenant.id, payload)

@router.get(
    "",
    response_model=list[RoleResponse],
    dependencies=[Depends(require_permission("role.read"))],
)
def list_roles_api(
    tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db),
):
    return list_roles(db, tenant.id)


@router.put(
    "/{role_id}",
    response_model=RoleResponse,
    dependencies=[Depends(require_permission("role.update"))],
)
def update_role_api(
    role_id: str,
    payload: RoleUpdate,
    tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db),
):
    role = (
        db.query(Role)
        .filter(
            Role.id == role_id,
            Role.tenant_id == tenant.id,
        )
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )

    return update_role(db, role, payload)


@router.put(
    "/{role_id}/permissions",
    status_code=204,
    dependencies=[Depends(require_permission("role.permission.update"))],
)
def update_role_permissions_api(
    role_id: str,
    payload: RolePermissionUpdate,
    tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db),
):
    role = (
        db.query(Role)
        .filter(
            Role.id == role_id,
            Role.tenant_id == tenant.id,
        )
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )

    replace_role_permissions(db, role.id, payload.permission_ids)

    # Invalidate the gateway's Redis cache for this role
    import httpx
    from app.core.config import settings
    try:
        httpx.post(
            f"{settings.API_GATEWAY_URL}/internal/cache/invalidate-role/{role.id}",
            timeout=3.0,
        )
    except Exception:
        pass  # Best-effort — don't fail the request if gateway is unreachable
