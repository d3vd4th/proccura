from sqlalchemy.orm import Session
from app.models.user import User
from app.models.tenant_user import TenantUser
from app.core.security import hash_password


def create_user(
    db: Session,
    tenant_id: str,
    payload,
):
    # Check if user exists globally
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        user = User(
            email=payload.email,
            full_name=payload.full_name,
            password_hash=hash_password(payload.password),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Check tenant membership
    existing = (
        db.query(TenantUser)
        .filter(
            TenantUser.user_id == user.id,
            TenantUser.tenant_id == tenant_id,
        )
        .first()
    )

    if existing:
        return user

    tenant_user = TenantUser(
        user_id=user.id,
        tenant_id=tenant_id,
        role_id=payload.role_id,
        status="active",
    )

    db.add(tenant_user)
    db.commit()

    return user


def list_users(db: Session, tenant_id: str):
    return (
        db.query(User)
        .join(TenantUser)
        .filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.status == "active",
        )
        .all()
    )


def update_user(db: Session, user: User, payload):
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    return user
