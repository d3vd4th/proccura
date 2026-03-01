from sqlalchemy.orm import Session
from typing import Optional
from fastapi import HTTPException, status
from app.models.invitation import Invitation
from app.models.vendor_pre_registration import VendorPreRegistration
from app.models.vendor_questionnaire_assignment import VendorQuestionnaireAssignment
from app.schemas.invitation import VendorPreRegistrationCreate
from app.schemas.vendor_questionnaire import VendorQuestionnaireAssignCreate
from app.services.invitation_service import InvitationService
from app.services.email_service import send_pre_registration_notification


class PreRegistrationService:
    @staticmethod
    def verify_token(db: Session, token: str) -> Invitation:
        """Verify an invitation token and return the invitation."""
        return InvitationService.verify_invitation_token(db, token)

    @staticmethod
    def submit_pre_registration(
        db: Session,
        token: str,
        registration_data: VendorPreRegistrationCreate,
    ) -> VendorPreRegistration:
        """Submit vendor pre-registration using an invitation token."""

        # Verify the token first
        invitation = InvitationService.verify_invitation_token(db, token)

        # Check if already registered with this invitation
        existing = db.query(VendorPreRegistration).filter(
            VendorPreRegistration.invitation_id == invitation.id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration has already been submitted for this invitation"
            )

        # Create pre-registration record
        pre_registration = VendorPreRegistration(
            invitation_id=invitation.id,
            tenant_id=invitation.tenant_id,
            business_name=registration_data.business_name,
            contact_person=registration_data.contact_person,
            email=registration_data.email,
            phone=registration_data.phone,
            address_line1=registration_data.address_line1,
            address_line2=registration_data.address_line2,
            city=registration_data.city,
            state=registration_data.state,
            postal_code=registration_data.postal_code,
            country=registration_data.country,
            gst_number=registration_data.gst_number,
            pan_number=registration_data.pan_number,
            business_type=registration_data.business_type,
            products_services=registration_data.products_services,
        )

        db.add(pre_registration)

        # Update invitation status
        invitation.status = "PRE_REGISTERED"

        db.commit()
        db.refresh(pre_registration)
        
        
        # Send notification to the inviter
        # FIXME: Notification disabled as created_by_email was removed by request.
        # Need to fetch user email using invitation.created_by (UUID) from Auth Service to re-enable.
        '''
        if invitation.created_by_email:
            send_pre_registration_notification(
                to_email=invitation.created_by_email,
                vendor_name=pre_registration.contact_person,
                business_name=pre_registration.business_name,
            )
        '''

        return pre_registration

    @staticmethod
    def get_pre_registrations(
        db: Session,
        tenant_id: str,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None
    ) -> dict:
        query = db.query(VendorPreRegistration).filter(VendorPreRegistration.tenant_id == tenant_id)

        if search:
            query = query.filter(
                (VendorPreRegistration.business_name.ilike(f"%{search}%")) |
                (VendorPreRegistration.email.ilike(f"%{search}%"))
            )

        total = query.count()
        total_pages = (total + limit - 1) // limit

        items = query.order_by(VendorPreRegistration.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }

    @staticmethod
    def get_pre_registration(db: Session, id: str, tenant_id: str) -> Optional[VendorPreRegistration]:
        return db.query(VendorPreRegistration).filter(
            VendorPreRegistration.id == id,
            VendorPreRegistration.tenant_id == tenant_id
        ).first()

    @staticmethod
    def assign_questionnaires(
        db: Session, 
        pre_registration_id: str, 
        assign_data: VendorQuestionnaireAssignCreate, 
        tenant_id: str
    ):
        pre_reg = PreRegistrationService.get_pre_registration(db, pre_registration_id, tenant_id)
        if not pre_reg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pre-registration not found")

        # Delete existing ones
        db.query(VendorQuestionnaireAssignment).filter(
            VendorQuestionnaireAssignment.pre_registration_id == pre_registration_id,
        ).delete()

        # Add new ones
        new_assignments = []
        for q_id in assign_data.questionnaire_ids:
            assignment = VendorQuestionnaireAssignment(
                tenant_id=tenant_id,
                pre_registration_id=pre_registration_id,
                questionnaire_id=q_id,
                status="Pending"
            )
            db.add(assignment)
            new_assignments.append(assignment)
        
        db.commit()
        for a in new_assignments:
            db.refresh(a)
            
        return new_assignments

    @staticmethod
    def get_assigned_questionnaires(db: Session, pre_registration_id: str, tenant_id: str):
        pre_reg = PreRegistrationService.get_pre_registration(db, pre_registration_id, tenant_id)
        if not pre_reg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pre-registration not found")

        return db.query(VendorQuestionnaireAssignment).filter(
            VendorQuestionnaireAssignment.pre_registration_id == pre_registration_id,
        ).all()
