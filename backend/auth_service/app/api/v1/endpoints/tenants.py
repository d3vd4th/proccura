from fastapi import APIRouter, Depends, HTTPException, logger, status
from sqlalchemy.orm import Session
import logging
from app.schemas.tenant import (
    TenantCreate, TenantUpdate, TenantResponse
)
from app.services.tenant_service import (
    create_tenant, update_tenant, get_tenant, list_tenants
)
from app.dependencies.auth import require_super_admin
from app.api.deps import get_db
from app.dependencies.tenant import get_current_tenant  

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
router = APIRouter()  

@router.post("/create", response_model=TenantResponse, status_code=201)
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


@router.get("/list", response_model=list[TenantResponse])
def list_tenants_api(
    db: Session = Depends(get_db),
    _=Depends(require_super_admin)
):   
    tenants = list_tenants(db)
    logger.info(f"Listed {len(tenants)} tenants")
    return tenants


@router.get("/{tenant_id}", response_model=TenantResponse)
def get_tenant_api(
    tenant_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_tenant)
):
    tenant = get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant
