import uuid
from sqlalchemy import Column, String, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class VendorPreRegistration(Base):
    __tablename__ = "vendor_pre_registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invitation_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Business info
    business_name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    # Address
    address_line1 = Column(String, nullable=False)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    country = Column(String, nullable=False)

    # Business details
    gst_number = Column(String, nullable=True)
    pan_number = Column(String, nullable=True)
    business_type = Column(String, nullable=True)
    products_services = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    questionnaire_assignments = relationship("VendorQuestionnaireAssignment", back_populates="pre_registration", cascade="all, delete-orphan")
