from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from shared.database import Base

class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id = Column(
        String(36),
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True
    )
    permission_id = Column(
        String(36),
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True
    )

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id"),
    )
