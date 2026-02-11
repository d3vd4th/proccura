import math
import secrets
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from fastapi import HTTPException, status
from app.models.invitation import Invitation
from app.schemas.invitation import InvitationCreate
from app.services.email_service import send_invitation_email


class InvitationService:
    @staticmethod
    def _generate_token() -> str:
        """Generate a unique, URL-safe invitation token."""
        return secrets.token_urlsafe(32)

    @staticmethod
    def create_invitation(
        db: Session, 
        invitation_in: InvitationCreate,
        tenant_id: str,
        created_by: Optional[str] = None
    ) -> Invitation:
        token = InvitationService._generate_token()
        
        db_invitation = Invitation(
            tenant_id=tenant_id,
            business_name=invitation_in.business_name,
            email=invitation_in.email,
            invitation_token=token,
        )
        db.add(db_invitation)
        db.commit()
        db.refresh(db_invitation)
        
        # Send invitation email
        try:
            send_invitation_email(
                to_email=invitation_in.email,
                business_name=invitation_in.business_name,
                invitation_token=token,
            )
        except Exception:
            # Email failed but invitation is created — don't roll back
            pass
        
        return db_invitation

    @staticmethod
    def get_invitations(
        db: Session, 
        tenant_id: str,
        page: int = 1, 
        limit: int = 10,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> dict:
        query = db.query(Invitation).filter(Invitation.tenant_id == tenant_id)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Invitation.email.ilike(search_term),
                    Invitation.business_name.ilike(search_term),
                )
            )

        if status_filter:
            query = query.filter(Invitation.status == status_filter)

        total = query.count()
        total_pages = math.ceil(total / limit) if total > 0 else 1

        skip = (page - 1) * limit
        items = query.order_by(Invitation.created_at.desc()).offset(skip).limit(limit).all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    def verify_invitation_token(db: Session, token: str) -> Invitation:
        """Verify an invitation token and return the invitation."""
        invitation = db.query(Invitation).filter(
            Invitation.invitation_token == token
        ).first()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation link"
            )
        
        if invitation.status == "PRE_REGISTERED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invitation has already been used for registration"
            )
        
        if invitation.status == "EXPIRED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invitation has expired"
            )
        
        return invitation

    @staticmethod
    def resend_invitation(db: Session, invitation_id: str) -> Invitation:
        """Resend invitation email."""
        invitation = db.query(Invitation).filter(
            Invitation.id == invitation_id
        ).first()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found"
            )
        
        if invitation.status != "PENDING":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only resend pending invitations"
            )
        
        send_invitation_email(
            to_email=invitation.email,
            business_name=invitation.business_name,
            invitation_token=invitation.invitation_token,
        )
        
        return invitation

    @staticmethod
    def delete_invitation(db: Session, invitation_id: str):
        """Delete an invitation."""
        invitation = db.query(Invitation).filter(
            Invitation.id == invitation_id
        ).first()
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found"
            )
        
        db.delete(invitation)
        db.commit()
