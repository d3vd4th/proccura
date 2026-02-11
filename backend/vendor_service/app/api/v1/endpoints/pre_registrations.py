from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.invitation import PaginatedVendorPreRegistrations
from app.services.pre_registration_service import PreRegistrationService
from app.dependencies.auth import get_tenant_id

router = APIRouter()

@router.get("", response_model=PaginatedVendorPreRegistrations)
def list_pre_registrations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return PreRegistrationService.get_pre_registrations(
        db=db,
        tenant_id=tenant_id,
        page=page,
        limit=limit,
        search=search,
    )
