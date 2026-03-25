import logging
from typing import List, Dict, Any
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.dependencies.auth import UserContext
from app.models.vendor_user import VendorUser
from app.models.vendor_questionnaire_assignment import VendorQuestionnaireAssignment
from app.models.vendor_registration import VendorRegistration, RegistrationStatus
from app.models.questionnaire import Questionnaire
from app.schemas.vendor_questionnaire import VendorQuestionnaireSubmit

logger = logging.getLogger(__name__)

class VendorPortalService:

    @staticmethod
    def get_vendor_registration_for_user(db: Session, user: UserContext) -> VendorRegistration:
        if user.user_type != "VENDOR":
            raise HTTPException(status_code=403, detail="Only vendor users can access this portal")
            
        vendor_user = db.query(VendorUser).filter(
            VendorUser.auth_user_id == user.id,
            VendorUser.tenant_id == user.tenant_id
        ).first()
        
        if not vendor_user:
            raise HTTPException(status_code=404, detail="Vendor user profile not found")
            
        registration = db.query(VendorRegistration).filter(
            VendorRegistration.id == vendor_user.registration_id,
            VendorRegistration.tenant_id == user.tenant_id
        ).first()
        
        if not registration:
            raise HTTPException(status_code=404, detail="Vendor registration not found")
            
        return registration

    @staticmethod
    def get_vendor_assigned_questionnaires(db: Session, user: UserContext) -> Dict[str, List[dict]]:
        registration = VendorPortalService.get_vendor_registration_for_user(db, user)
        
        assignments = db.query(VendorQuestionnaireAssignment, Questionnaire).join(
            Questionnaire, VendorQuestionnaireAssignment.questionnaire_id == Questionnaire.id
        ).filter(
            VendorQuestionnaireAssignment.pre_registration_id == registration.id,
            VendorQuestionnaireAssignment.tenant_id == user.tenant_id
        ).all()
        
        grouped_assignments = {}
        for assignment, questionnaire in assignments:
            domain = questionnaire.domain
            if domain not in grouped_assignments:
                grouped_assignments[domain] = []
                
            grouped_assignments[domain].append({
                "assignment_id": str(assignment.id),
                "questionnaire_id": str(questionnaire.id),
                "status": assignment.status,
                "response": assignment.response,
                "assigned_at": assignment.assigned_at,
                "question": questionnaire.question,
                "type": questionnaire.type.value,
                "expected_response": questionnaire.expected_response,
                "attachment_required": questionnaire.attachment_required
            })
            
        return grouped_assignments

    @staticmethod
    def submit_vendor_questionnaires(db: Session, submission: VendorQuestionnaireSubmit, user: UserContext) -> dict:
        registration = VendorPortalService.get_vendor_registration_for_user(db, user)
        
        # Process submissions
        for item in submission.responses:
            assignment = db.query(VendorQuestionnaireAssignment).filter(
                VendorQuestionnaireAssignment.id == item.assignment_id,
                VendorQuestionnaireAssignment.pre_registration_id == registration.id,
                VendorQuestionnaireAssignment.tenant_id == user.tenant_id
            ).first()
            
            if assignment:
                assignment.response = item.response
                assignment.status = "Completed"
                assignment.completed_at = func.now()
                
        # Update registration status if all completed
        total_assignments = db.query(VendorQuestionnaireAssignment).filter(
            VendorQuestionnaireAssignment.pre_registration_id == registration.id
        ).count()
        
        completed_assignments = db.query(VendorQuestionnaireAssignment).filter(
            VendorQuestionnaireAssignment.pre_registration_id == registration.id,
            VendorQuestionnaireAssignment.status == "Completed"
        ).count()
        
        # Check if this was the last submission
        if total_assignments > 0 and total_assignments == completed_assignments:
            registration.status = RegistrationStatus.SUBMITTED
        elif completed_assignments > 0:
            registration.status = RegistrationStatus.IN_PROGRESS
            
        db.commit()
        
        return {"message": "Responses submitted successfully", "registration_status": registration.status}
