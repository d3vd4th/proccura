from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.schemas.questionnaire import QuestionnaireCreate, QuestionnaireUpdate, QuestionnaireOut, PaginatedQuestionnaires
from app.services.questionnaire_service import QuestionnaireService
from app.dependencies.auth import get_tenant_id, get_current_user, UserContext

router = APIRouter()

@router.post("", response_model=QuestionnaireOut)
def create_questionnaire(
    questionnaire: QuestionnaireCreate, 
    user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return QuestionnaireService.create_questionnaire(
        db=db, 
        questionnaire_in=questionnaire,
        tenant_id=user.tenant_id
    )

@router.get("", response_model=PaginatedQuestionnaires)
def list_questionnaires(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    search: Optional[str] = None,
    domain: Optional[str] = None,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return QuestionnaireService.get_questionnaires(
        db=db, 
        tenant_id=tenant_id,
        page=page, 
        limit=limit,
        search=search,
        domain_filter=domain
    )

@router.get("/domains", response_model=List[str])
def list_questionnaire_domains(
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return QuestionnaireService.get_domains(db=db, tenant_id=tenant_id)

@router.get("/{id}", response_model=QuestionnaireOut)
def get_questionnaire(
    id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return QuestionnaireService.get_questionnaire(db=db, id=id, tenant_id=tenant_id)

@router.put("/{id}", response_model=QuestionnaireOut)
def update_questionnaire(
    id: str,
    questionnaire: QuestionnaireUpdate,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return QuestionnaireService.update_questionnaire(db=db, id=id, questionnaire_in=questionnaire, tenant_id=tenant_id)

@router.delete("/{id}")
def delete_questionnaire(
    id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    QuestionnaireService.delete_questionnaire(db=db, id=id, tenant_id=tenant_id)
    return {"detail": "Questionnaire deleted"}

@router.post("/upload", response_model=List[QuestionnaireOut])
async def upload_questionnaires(
    file: UploadFile = File(...),
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return await QuestionnaireService.upload_from_excel(db=db, file=file, tenant_id=tenant_id)
