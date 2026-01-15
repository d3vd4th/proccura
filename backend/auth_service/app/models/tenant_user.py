import uuid
from sqlalchemy import Column, Enum, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from shared.database import Base
from shared.enums import TenantUserStatus

class TenantUser(Base):
    __tablename__ = "tenant_users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    tenant_id = Column(
        String(36),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    role_id = Column(
        String(36),
        ForeignKey("roles.id"),
        nullable=False
    )

    status = Column(
        Enum(TenantUserStatus, name="tenant_user_status"),
        default=TenantUserStatus.ACTIVE,
        nullable=False
    ) 

    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("tenant_id", "user_id"),
    )
