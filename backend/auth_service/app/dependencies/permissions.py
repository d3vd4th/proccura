from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth_service.app.models.role_permission import RolePermission
from auth_service.app.models.permission import Permission
from auth_service.app.models.tenant_user import TenantUser
from auth_service.app.dependencies.auth import get_current_user
from auth_service.app.dependencies.tenant import get_current_tenant
from auth_service.app.api.deps import get_db  



def require_permission(permission_code: str):
    def checker(
        current_user = Depends(get_current_user),
        tenant = Depends(get_current_tenant),
        db: Session = Depends(get_db),
    ):
        # Super admin bypass
        if current_user.is_super_admin:
            return True

        tenant_user = (
            db.query(TenantUser)
            .filter(
                TenantUser.user_id == current_user.id,
                TenantUser.tenant_id == tenant.id,
                TenantUser.status == "active",
            )
            .first()
        )

        if not tenant_user:
            raise HTTPException(status_code=403, detail="No tenant access")

        permission = (
            db.query(Permission)
            .join(RolePermission)
            .filter(
                RolePermission.role_id == tenant_user.role_id,
                Permission.code == permission_code,
            )
            .first()
        )

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {permission_code}",
            )

        return True

    return checker
