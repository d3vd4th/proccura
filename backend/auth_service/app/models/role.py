import uuid
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from shared.database import Base
from sqlalchemy import ForeignKey, UniqueConstraint

class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True)
    tenant_id = Column(
        String(36),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(String(100), nullable=False)
    description = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("tenant_id", "name"),
    )
