from sqlalchemy.orm import Session
from typing import Optional
from app.models.invitation import Invitation
from app.schemas.invitation import InvitationCreate

class InvitationService:
    @staticmethod
    def create_invitation(
        db: Session, 
        invitation_in: InvitationCreate,
        tenant_id: str
    ) -> Invitation:
        db_invitation = Invitation(
            tenant_id=tenant_id,
            business_name=invitation_in.business_name,
            email=invitation_in.email
        )
        db.add(db_invitation)
        db.commit()
        db.refresh(db_invitation)
        return db_invitation

    @staticmethod
    def get_invitations(
        db: Session, 
        tenant_id: str,
        skip: int = 0, 
        limit: int = 100
    ):
        return (
            db.query(Invitation)
            .filter(Invitation.tenant_id == tenant_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

