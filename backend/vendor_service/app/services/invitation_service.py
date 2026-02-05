from sqlalchemy.orm import Session
from app.models.invitation import Invitation
from app.schemas.invitation import InvitationCreate

class InvitationService:
    @staticmethod
    def create_invitation(db: Session, invitation_in: InvitationCreate) -> Invitation:
        db_invitation = Invitation(
            business_name=invitation_in.business_name,
            email=invitation_in.email
        )
        db.add(db_invitation)
        db.commit()
        db.refresh(db_invitation)
        return db_invitation

    @staticmethod
    def get_invitations(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Invitation).offset(skip).limit(limit).all()
