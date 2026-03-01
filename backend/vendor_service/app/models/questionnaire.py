import uuid
from sqlalchemy import Column, String, DateTime, Boolean, func, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum
from sqlalchemy.orm import relationship

class QuestionType(str, enum.Enum):
    TEXT = "text"
    YES_NO = "yes_no"
    MULTIPLE_CHOICE = "multiple_choice"

class Questionnaire(Base):
    __tablename__ = "questionnaires"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    domain = Column(String, nullable=False)
    type = Column(Enum(QuestionType), nullable=False, default=QuestionType.TEXT)
    question = Column(String, nullable=False)
    expected_response = Column(String, nullable=True)
    attachment_required = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship to Vendor Assignments
    assignments = relationship("VendorQuestionnaireAssignment", back_populates="questionnaire", cascade="all, delete-orphan")
