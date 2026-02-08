from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.invitation import InvitationCreate, InvitationOut
from app.services.invitation_service import InvitationService
from app.dependencies.auth import get_tenant_id

router = APIRouter()

@router.post("/", response_model=InvitationOut)
def create_invitation(
    invitation: InvitationCreate, 
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return InvitationService.create_invitation(
        db=db, 
        invitation_in=invitation,
        tenant_id=tenant_id
    )

@router.get("/", response_model=List[InvitationOut])
def list_invitations(
    skip: int = 0, 
    limit: int = 100, 
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return InvitationService.get_invitations(
        db=db, 
        tenant_id=tenant_id,
        skip=skip, 
        limit=limit
    )

