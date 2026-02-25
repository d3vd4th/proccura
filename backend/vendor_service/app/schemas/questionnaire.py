from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from app.models.questionnaire import QuestionType

class QuestionnaireBase(BaseModel):
    domain: str
    type: QuestionType = QuestionType.TEXT
    question: str
    expected_response: Optional[str] = None
    attachment_required: bool = False


class QuestionnaireCreate(QuestionnaireBase):
    pass


class QuestionnaireUpdate(BaseModel):
    domain: Optional[str] = None
    type: Optional[QuestionType] = None
    question: Optional[str] = None
    expected_response: Optional[str] = None
    attachment_required: Optional[bool] = None


class QuestionnaireOut(QuestionnaireBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedQuestionnaires(BaseModel):
    items: List[QuestionnaireOut]
    total: int
    page: int
    limit: int
    total_pages: int
