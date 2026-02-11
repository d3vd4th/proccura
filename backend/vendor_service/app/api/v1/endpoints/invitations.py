from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.invitation import InvitationCreate, InvitationOut, PaginatedInvitations
from app.services.invitation_service import InvitationService
from app.services.invitation_service import InvitationService
from app.dependencies.auth import get_tenant_id, get_current_user, UserContext

router = APIRouter()

@router.post("", response_model=InvitationOut)
def create_invitation(
    invitation: InvitationCreate, 
    user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return InvitationService.create_invitation(
        db=db, 
        invitation_in=invitation,
        tenant_id=user.tenant_id,
        created_by=user.id
    )

@router.get("", response_model=PaginatedInvitations)
def list_invitations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return InvitationService.get_invitations(
        db=db, 
        tenant_id=tenant_id,
        page=page, 
        limit=limit,
        search=search,
        status_filter=status,
    )

@router.post("/{invitation_id}/resend", response_model=InvitationOut)
def resend_invitation(
    invitation_id: str,
    db: Session = Depends(get_db)
):
    return InvitationService.resend_invitation(db=db, invitation_id=invitation_id)

@router.delete("/{invitation_id}")
def delete_invitation(
    invitation_id: str,
    db: Session = Depends(get_db)
):
    InvitationService.delete_invitation(db=db, invitation_id=invitation_id)
    return {"detail": "Invitation deleted"}
