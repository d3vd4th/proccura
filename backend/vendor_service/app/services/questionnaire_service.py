import math
import pandas as pd
from typing import Optional, List
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.questionnaire import Questionnaire, QuestionType
from app.schemas.questionnaire import QuestionnaireCreate, QuestionnaireUpdate

class QuestionnaireService:
    @staticmethod
    def create_questionnaire(
        db: Session,
        questionnaire_in: QuestionnaireCreate,
        tenant_id: str
    ) -> Questionnaire:
        final_expected_response = questionnaire_in.expected_response if questionnaire_in.type == QuestionType.YES_NO else None

        db_obj = Questionnaire(
            tenant_id=tenant_id,
            domain=questionnaire_in.domain,
            type=questionnaire_in.type,
            question=questionnaire_in.question,
            expected_response=final_expected_response,
            attachment_required=questionnaire_in.attachment_required,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def get_questionnaires(
        db: Session,
        tenant_id: str,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        domain_filter: Optional[str] = None
    ) -> dict:
        query = db.query(Questionnaire).filter(Questionnaire.tenant_id == tenant_id)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Questionnaire.question.ilike(search_term),
                    Questionnaire.domain.ilike(search_term)
                )
            )
            
        if domain_filter:
            query = query.filter(Questionnaire.domain == domain_filter)

        total = query.count()
        total_pages = math.ceil(total / limit) if total > 0 else 1
        skip = (page - 1) * limit
        items = query.order_by(Questionnaire.created_at.desc()).offset(skip).limit(limit).all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    def get_questionnaire(db: Session, id: str, tenant_id: str) -> Questionnaire:
        obj = db.query(Questionnaire).filter(
            Questionnaire.id == id,
            Questionnaire.tenant_id == tenant_id
        ).first()
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Questionnaire not found"
            )
        return obj

    @staticmethod
    def update_questionnaire(
        db: Session,
        id: str,
        questionnaire_in: QuestionnaireUpdate,
        tenant_id: str
    ) -> Questionnaire:
        db_obj = QuestionnaireService.get_questionnaire(db, id, tenant_id)
        update_data = questionnaire_in.model_dump(exclude_unset=True)
        
        # Enforce conditional rule if type is present or updating expected_response
        current_type = update_data.get('type', db_obj.type)
        if current_type != QuestionType.YES_NO:
            update_data['expected_response'] = None

        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete_questionnaire(db: Session, id: str, tenant_id: str):
        db_obj = QuestionnaireService.get_questionnaire(db, id, tenant_id)
        db.delete(db_obj)
        db.commit()

    @staticmethod
    async def upload_from_excel(db: Session, file: UploadFile, tenant_id: str) -> List[Questionnaire]:
        if not file.filename.endswith(('.xls', '.xlsx')):
            raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")
            
        try:
            contents = await file.read()
            import io
            df = pd.read_excel(io.BytesIO(contents))
            
            # Expected columns: Domain, Question, Expected Response, Attachment
            # Map columns, doing case-insensitive match or strict. We'll be flexible on case.
            cols = [str(c).lower().strip() for c in df.columns]
            df.columns = cols
            
            if 'domain' not in cols or 'question' not in cols:
                raise HTTPException(status_code=400, detail="Excel must contain 'Domain' and 'Question' columns.")
                
            created_items = []
            
            for index, row in df.iterrows():
                domain = str(row['domain']) if pd.notna(row['domain']) else ""
                question = str(row['question']) if pd.notna(row['question']) else ""
                
                if not domain or not question:
                    continue # Skip empty rows
                    
                expected_response = None
                if 'expected response' in cols and pd.notna(row['expected response']):
                    expected_response = str(row['expected response'])
                elif 'expected_response' in cols and pd.notna(row['expected_response']):
                    expected_response = str(row['expected_response'])
                    
                # Parse type if exists, else infer from expected_response
                q_type = QuestionType.TEXT
                if 'type' in cols and pd.notna(row['type']):
                    val = str(row['type']).lower().strip()
                    if val == 'yes_no' or val == 'yes/no':
                        q_type = QuestionType.YES_NO
                    elif val == 'multiple_choice':
                         q_type = QuestionType.MULTIPLE_CHOICE
                elif expected_response and expected_response.lower() in ['yes', 'no']:
                    q_type = QuestionType.YES_NO

                if q_type != QuestionType.YES_NO:
                    expected_response = None
                
                attachment_required = False
                if 'attachment' in cols and pd.notna(row['attachment']):
                    val = str(row['attachment']).lower().strip()
                    if val in ['yes', 'true', '1', 'y']:
                        attachment_required = True
                        
                db_obj = Questionnaire(
                    tenant_id=tenant_id,
                    domain=domain,
                    type=q_type,
                    question=question,
                    expected_response=expected_response,
                    attachment_required=attachment_required
                )
                db.add(db_obj)
                created_items.append(db_obj)
                
            db.commit()
            for item in created_items:
                db.refresh(item)
            return created_items
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")
