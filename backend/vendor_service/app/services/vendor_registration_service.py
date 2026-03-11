from sqlalchemy.orm import Session
from typing import Optional
from fastapi import HTTPException, status
from app.models.invitation import Invitation
from app.models.vendor_registration import VendorRegistration, RegistrationStatus
from app.models.vendor_questionnaire_assignment import VendorQuestionnaireAssignment
from app.schemas.invitation import VendorRegistrationCreate
from app.schemas.vendor_questionnaire import VendorQuestionnaireAssignCreate
from app.services.invitation_service import InvitationService
from app.services.email_service import send_registration_notification


class VendorRegistrationService:
    @staticmethod
    def verify_token(db: Session, token: str) -> Invitation:
        """Verify an invitation token and return the invitation."""
        return InvitationService.verify_invitation_token(db, token)

    @staticmethod
    def submit_registration(
        db: Session,
        token: str,
        registration_data: VendorRegistrationCreate,
    ) -> VendorRegistration:
        """Submit vendor registration using an invitation token."""

        # Verify the token first
        invitation = InvitationService.verify_invitation_token(db, token)

        # Check if already registered with this invitation
        existing = db.query(VendorRegistration).filter(
            VendorRegistration.invitation_id == invitation.id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration has already been submitted for this invitation"
            )

        # Create registration record
        registration = VendorRegistration(
            invitation_id=invitation.id,
            tenant_id=invitation.tenant_id,
            business_name=registration_data.business_name,
            contact_person=registration_data.contact_person,
            contact_person_email=registration_data.contact_person_email,
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

        db.add(registration)

        # Update invitation status
        invitation.status = "REGISTERED"

        db.commit()
        db.refresh(registration)

        return registration

    @staticmethod
    def get_registrations(
        db: Session,
        tenant_id: str,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None
    ) -> dict:
        query = db.query(VendorRegistration).filter(VendorRegistration.tenant_id == tenant_id)

        if search:
            query = query.filter(
                (VendorRegistration.business_name.ilike(f"%{search}%")) |
                (VendorRegistration.email.ilike(f"%{search}%"))
            )

        total = query.count()
        total_pages = (total + limit - 1) // limit

        items = query.order_by(VendorRegistration.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }

    @staticmethod
    def get_registration(db: Session, id: str, tenant_id: str) -> Optional[VendorRegistration]:
        return db.query(VendorRegistration).filter(
            VendorRegistration.id == id,
            VendorRegistration.tenant_id == tenant_id
        ).first()

    @staticmethod
    def assign_questionnaires(
        db: Session, 
        registration_id: str, 
        assign_data: VendorQuestionnaireAssignCreate, 
        tenant_id: str
    ):
        reg = VendorRegistrationService.get_registration(db, registration_id, tenant_id)
        if not reg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor registration not found")

        # Delete existing ones
        db.query(VendorQuestionnaireAssignment).filter(
            VendorQuestionnaireAssignment.pre_registration_id == registration_id,
        ).delete()

        # Add new ones
        new_assignments = []
        for q_id in assign_data.questionnaire_ids:
            assignment = VendorQuestionnaireAssignment(
                tenant_id=tenant_id,
                pre_registration_id=registration_id,
                questionnaire_id=q_id,
                status="Pending"
            )
            db.add(assignment)
            new_assignments.append(assignment)
        
        db.commit()
        for a in new_assignments:
            db.refresh(a)

        # Update registration status
        reg.status = RegistrationStatus.QUESTIONNAIRES_ASSIGNED
        db.commit()

        return new_assignments

    @staticmethod
    def get_assigned_questionnaires(db: Session, registration_id: str, tenant_id: str):
        reg = VendorRegistrationService.get_registration(db, registration_id, tenant_id)
        if not reg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor registration not found")

        return db.query(VendorQuestionnaireAssignment).filter(
            VendorQuestionnaireAssignment.pre_registration_id == registration_id,
        ).all()
