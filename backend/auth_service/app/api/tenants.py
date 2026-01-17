from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from shared.database import SessionLocal
from auth_service.app.schemas.tenant import (
    TenantCreate, TenantUpdate, TenantResponse
)
from auth_service.app.services.tenant_service import (
    create_tenant, update_tenant, get_tenant, list_tenants
)
from auth_service.app.dependencies.auth import require_super_admin

router = APIRouter(prefix="/tenants", tags=["Tenants"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=TenantResponse, status_code=201)
def create_tenant_api(
    payload: TenantCreate,
    db: Session = Depends(get_db),
    _=Depends(require_super_admin)
):
    return create_tenant(db, payload)


@router.put("/{tenant_id}", response_model=TenantResponse)
def update_tenant_api(
    tenant_id: str,
    payload: TenantUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_super_admin)
):
    tenant = get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return update_tenant(db, tenant, payload)


@router.get("", response_model=list[TenantResponse])
def list_tenants_api(
    db: Session = Depends(get_db),
    _=Depends(require_super_admin)
):
    return list_tenants(db)


@router.get("/{tenant_id}", response_model=TenantResponse)
def get_tenant_api(
    tenant_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_super_admin)
):
    tenant = get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant
