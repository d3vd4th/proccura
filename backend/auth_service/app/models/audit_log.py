import uuid
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from shared.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    actor_user_id = Column(String(36), nullable=True)
    tenant_id = Column(String(36), nullable=True)

    action = Column(String(100), nullable=False)

    entity_type = Column(String(100), nullable=False)

    entity_id = Column(String(36), nullable=False)

    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
