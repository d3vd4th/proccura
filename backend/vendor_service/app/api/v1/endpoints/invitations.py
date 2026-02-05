from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.invitation import InvitationCreate, InvitationOut
from app.services.invitation_service import InvitationService

router = APIRouter()

@router.post("/", response_model=InvitationOut)
def create_invitation(invitation: InvitationCreate, db: Session = Depends(get_db)):
    return InvitationService.create_invitation(db=db, invitation_in=invitation)

@router.get("/", response_model=List[InvitationOut])
def list_invitations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return InvitationService.get_invitations(db=db, skip=skip, limit=limit)
