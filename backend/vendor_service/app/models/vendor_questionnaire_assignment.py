import uuid
from sqlalchemy import Column, String, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class VendorQuestionnaireAssignment(Base):
    __tablename__ = "vendor_questionnaire_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    pre_registration_id = Column(UUID(as_uuid=True), ForeignKey("vendor_pre_registrations.id", ondelete="CASCADE"), nullable=False, index=True)
    domain = Column(String, nullable=False)
    status = Column(String, default="Pending", nullable=False) # e.g., Pending, In Progress, Completed
    
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship to PreRegistration 
    pre_registration = relationship("VendorPreRegistration", back_populates="questionnaire_assignments")
