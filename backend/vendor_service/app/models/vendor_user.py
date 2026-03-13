import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class VendorUser(Base):
    __tablename__ = "vendor_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registration_id = Column(
        UUID(as_uuid=True),
        ForeignKey("vendor_pre_registrations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    auth_user_id = Column(String, nullable=False)  # User ID from auth service
    email = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)  # Primary contact person

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to VendorRegistration
    registration = relationship("VendorRegistration", backref="vendor_users")
