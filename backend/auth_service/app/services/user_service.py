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
        user.role_id = existing.role_id
        return user

    tenant_user = TenantUser(
        user_id=user.id,
        tenant_id=tenant_id,
        role_id=payload.role_id,
        status=TenantUserStatus.ACTIVE,
    )

    db.add(tenant_user)
    db.commit()

    user.role_id = payload.role_id
    return user


def list_users(db: Session, tenant_id: str):
    results = (
        db.query(User, TenantUser.role_id)
        .join(TenantUser)
        .filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.status == TenantUserStatus.ACTIVE,
        )
        .all()
    )
    users = []
    for user, role_id in results:
        user.role_id = role_id
        users.append(user)
    return users


def update_user(db: Session, user: User, tenant_id: str, payload):
    if payload.first_name is not None:
        user.first_name = payload.first_name
    if payload.last_name is not None:
        user.last_name = payload.last_name
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.profile_pic_url is not None:
        user.profile_pic_url = payload.profile_pic_url

    # Update role_id in TenantUser if provided
    if payload.role_id is not None:
        tenant_user = (
            db.query(TenantUser)
            .filter(
                TenantUser.user_id == user.id,
                TenantUser.tenant_id == tenant_id,
            )
            .first()
        )
        if tenant_user:
            tenant_user.role_id = payload.role_id

    db.commit()
    db.refresh(user)

    # Attach role_id to response
    tenant_user = (
        db.query(TenantUser)
        .filter(
            TenantUser.user_id == user.id,
            TenantUser.tenant_id == tenant_id,
        )
        .first()
    )
    user.role_id = tenant_user.role_id if tenant_user else None
    return user


def delete_user(db: Session, user_id: str, tenant_id: str):
    """Soft delete: Remove user from tenant by setting status to REMOVED"""
    tenant_user = (
        db.query(TenantUser)
        .filter(
            TenantUser.user_id == user_id,
            TenantUser.tenant_id == tenant_id,
            TenantUser.status != TenantUserStatus.REMOVED,
        )
        .first()
    )

    if not tenant_user:
        return None

    tenant_user.status = TenantUserStatus.REMOVED
    db.commit()
    return True
