from sqlalchemy.orm import Session
from app.models.user import User
from app.models.tenant_user import TenantUser, TenantUserStatus
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
            first_name=payload.first_name,
            last_name=payload.last_name,
            password_hash=hash_password(payload.password),
            profile_pic_url=payload.profile_pic_url,
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
        status=TenantUserStatus.ACTIVE,
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
            TenantUser.status == TenantUserStatus.ACTIVE,
        )
        .all()
    )


def update_user(db: Session, user: User, payload):
    if payload.first_name is not None:
        user.first_name = payload.first_name
    if payload.last_name is not None:
        user.last_name = payload.last_name
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.profile_pic_url is not None:
        user.profile_pic_url = payload.profile_pic_url

    db.commit()
    db.refresh(user)
    return user
