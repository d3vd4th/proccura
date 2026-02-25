from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.invitation import PaginatedVendorPreRegistrations, VendorPreRegistrationOut
from app.schemas.vendor_questionnaire import VendorQuestionnaireAssignCreate, VendorQuestionnaireAssignmentOut
from app.services.pre_registration_service import PreRegistrationService
from typing import List
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

@router.get("/{id}", response_model=VendorPreRegistrationOut)
def get_pre_registration(
    id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    pre_reg = PreRegistrationService.get_pre_registration(db, id, tenant_id)
    if not pre_reg:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Pre-registration not found")
    return pre_reg

@router.post("/{id}/questionnaires/assign", response_model=List[VendorQuestionnaireAssignmentOut])
def assign_questionnaires(
    id: str,
    assign_data: VendorQuestionnaireAssignCreate,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return PreRegistrationService.assign_questionnaires(db, id, assign_data, tenant_id)

@router.get("/{id}/questionnaires", response_model=List[VendorQuestionnaireAssignmentOut])
def get_assigned_questionnaires(
    id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return PreRegistrationService.get_assigned_questionnaires(db, id, tenant_id)
