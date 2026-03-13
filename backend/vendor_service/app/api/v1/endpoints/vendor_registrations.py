from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.schemas.invitation import PaginatedVendorRegistrations, VendorRegistrationOut
from app.schemas.vendor_questionnaire import VendorQuestionnaireAssignCreate, VendorQuestionnaireAssignmentOut
from app.schemas.vendor_user import VendorUserCreate, VendorUserOut
from app.services.vendor_registration_service import VendorRegistrationService
from app.services.vendor_user_service import VendorUserService
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


# --- Vendor User Endpoints ---

@router.post("/{id}/users", response_model=VendorUserOut, status_code=201)
def provision_vendor_user(
    id: str,
    user_data: VendorUserCreate,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """Provision a new vendor user for a registration."""
    return VendorUserService.provision_user(db, id, tenant_id, user_data)


@router.get("/{id}/users", response_model=List[VendorUserOut])
def list_vendor_users(
    id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """List all vendor users for a registration."""
    return VendorUserService.list_users(db, id, tenant_id)


@router.delete("/{id}/users/{user_id}", status_code=204)
def delete_vendor_user(
    id: str,
    user_id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """Remove a vendor user."""
    result = VendorUserService.delete_user(db, id, user_id, tenant_id)
    if not result:
        raise HTTPException(status_code=404, detail="Vendor user not found")
    return None

