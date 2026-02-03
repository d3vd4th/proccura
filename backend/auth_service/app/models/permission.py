import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    code = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    
    feature_id = Column(
        String(36),
        ForeignKey("features.id"),
        nullable=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to feature
    feature = relationship("Feature", back_populates="permissions")
