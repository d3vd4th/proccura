from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.invitation import (
    InvitationVerifyOut,
    VendorRegistrationCreate,
    VendorRegistrationOut,
)
from app.services.vendor_registration_service import VendorRegistrationService

router = APIRouter()


@router.get("/verify/{token}", response_model=InvitationVerifyOut)
def verify_invitation(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Public endpoint — no auth required.
    Verifies an invitation token and returns invitation details
    so the vendor can see who invited them and pre-fill the form.
    """
    return VendorRegistrationService.verify_token(db, token)


@router.post("/{token}", response_model=VendorRegistrationOut)
def submit_registration(
    token: str,
    registration_data: VendorRegistrationCreate,
    db: Session = Depends(get_db),
):
    """
    Public endpoint — no auth required.
    Submits the vendor registration form.
    Marks the invitation as REGISTERED.
    """
    return VendorRegistrationService.submit_registration(
        db=db,
        token=token,
        registration_data=registration_data,
    )
