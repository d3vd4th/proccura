import uuid
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from shared.database import Base

class AuthLog(Base):
    __tablename__ = "auth_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    user_id = Column(String(36), nullable=True)
    tenant_id = Column(String(36), nullable=True)

    action = Column(String(100), nullable=False)

    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)

    details = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
