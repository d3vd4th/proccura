from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role
from app.models.tenant_user import TenantUser, TenantUserStatus,UserType
from app.models.tenant import Tenant
from app.core.security import hash_password
from app.services.email_service import send_welcome_email


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
    # Get Tenant Name for email
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    tenant_name = tenant.name if tenant else "Proccura"

    # Get Role Name for email
    role = db.query(Role).filter(Role.id == payload.role_id).first()
    role_name = role.name if role else "User"

    # Send Welcome Email
    send_welcome_email(
        to_email=user.email,
        first_name=user.first_name,
        tenant_name=tenant_name,
        role_name=role_name,
    )

    user.role_id = payload.role_id
    return user


def list_users(
    db: Session,
    tenant_id: str,
    search: str = None,
    status: str = None,
    role_id: str = None,
    skip: int = 0,
    limit: int = 20,
):
    query = (
        db.query(User, TenantUser.role_id, TenantUser.status)
        .join(TenantUser)
        .filter(TenantUser.tenant_id == tenant_id,
        TenantUser.status != TenantUserStatus.REMOVED,
        TenantUser.user_type != UserType.VENDOR,
        )
    )

    if status:
        query = query.filter(TenantUser.status == status)

    if role_id:
        query = query.filter(TenantUser.role_id == role_id)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_filter))
            | (User.first_name.ilike(search_filter))
            | (User.last_name.ilike(search_filter))
        )

    results = query.offset(skip).limit(limit).all()

    users = []
    for user, role_id, user_status in results:
        user.role_id = role_id
        user.status = user_status.value if hasattr(user_status, "value") else user_status
        users.append(user)
    return users


def update_user(db: Session, user: User, tenant_id: str, payload):
    if payload.first_name is not None:
        user.first_name = payload.first_name
    if payload.last_name is not None:
        user.last_name = payload.last_name
    if payload.profile_pic_url is not None:
        user.profile_pic_url = payload.profile_pic_url

    # Find TenantUser record
    tenant_user = (
        db.query(TenantUser)
        .filter(
            TenantUser.user_id == user.id,
            TenantUser.tenant_id == tenant_id,
        )
        .first()
    )

    if tenant_user:
        # Update role_id in TenantUser if provided
        if payload.role_id is not None:
            tenant_user.role_id = payload.role_id
        
        # Update status in TenantUser if provided
        if payload.status is not None:
            tenant_user.status = payload.status

    db.commit()
    db.refresh(user)

    # Attach role_id and status to response
    if tenant_user:
        user.role_id = tenant_user.role_id
        user.status = tenant_user.status.value if hasattr(tenant_user.status, "value") else tenant_user.status
    else:
        user.role_id = None
        user.status = None
        
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
