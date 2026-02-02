from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.models.tenant import Tenant
from app.models.tenant_user import TenantUser, TenantUserStatus
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.api.deps import get_db  




def get_current_tenant(
    x_tenant_id: str = Header(..., alias="X-Tenant-ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.id == x_tenant_id).first()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    # Super admin can access any tenant
    if current_user.is_super_admin:
        return tenant

    # Normal users must belong to tenant
    membership = (
        db.query(TenantUser)
        .filter(
            TenantUser.tenant_id == tenant.id,
            TenantUser.user_id == current_user.id,
            TenantUser.status == TenantUserStatus.ACTIVE
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this tenant"
        )

    return tenant
