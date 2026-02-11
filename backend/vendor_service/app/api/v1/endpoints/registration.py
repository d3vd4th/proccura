from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.invitation import (
    InvitationVerifyOut,
    VendorPreRegistrationCreate,
    VendorPreRegistrationOut,
)
from app.services.pre_registration_service import PreRegistrationService

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
    return PreRegistrationService.verify_token(db, token)


@router.post("/{token}", response_model=VendorPreRegistrationOut)
def submit_pre_registration(
    token: str,
    registration_data: VendorPreRegistrationCreate,
    db: Session = Depends(get_db),
):
    """
    Public endpoint — no auth required.
    Submits the vendor pre-registration form.
    Marks the invitation as PRE_REGISTERED.
    """
    return PreRegistrationService.submit_pre_registration(
        db=db,
        token=token,
        registration_data=registration_data,
    )
