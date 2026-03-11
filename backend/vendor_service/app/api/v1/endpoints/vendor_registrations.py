from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.invitation import PaginatedVendorRegistrations, VendorRegistrationOut
from app.schemas.vendor_questionnaire import VendorQuestionnaireAssignCreate, VendorQuestionnaireAssignmentOut
from app.services.vendor_registration_service import VendorRegistrationService
from typing import List
from app.dependencies.auth import get_tenant_id

router = APIRouter()

@router.get("", response_model=PaginatedVendorRegistrations)
def list_vendor_registrations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return VendorRegistrationService.get_registrations(
        db=db,
        tenant_id=tenant_id,
        page=page,
        limit=limit,
        search=search,
    )

@router.get("/{id}", response_model=VendorRegistrationOut)
def get_vendor_registration(
    id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    reg = VendorRegistrationService.get_registration(db, id, tenant_id)
    if not reg:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Vendor registration not found")
    return reg

@router.post("/{id}/questionnaires/assign", response_model=List[VendorQuestionnaireAssignmentOut])
def assign_questionnaires(
    id: str,
    assign_data: VendorQuestionnaireAssignCreate,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return VendorRegistrationService.assign_questionnaires(db, id, assign_data, tenant_id)

@router.get("/{id}/questionnaires", response_model=List[VendorQuestionnaireAssignmentOut])
def get_assigned_questionnaires(
    id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return VendorRegistrationService.get_assigned_questionnaires(db, id, tenant_id)
