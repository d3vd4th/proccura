import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_user, UserContext
from app.schemas.vendor_questionnaire import VendorQuestionnaireSubmit
from app.services.vendor_portal_service import VendorPortalService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/questionnaires", response_model=Dict[str, List[dict]])
def get_vendor_assigned_questionnaires(
    user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all assigned questionnaires for the logged-in vendor user, grouped by domain.
    """
    return VendorPortalService.get_vendor_assigned_questionnaires(db, user)

@router.post("/questionnaires/submit")
def submit_vendor_questionnaires(
    submission: VendorQuestionnaireSubmit,
    user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit responses for multiple questionnaire assignments.
    """
    return VendorPortalService.submit_vendor_questionnaires(db, submission, user)
