from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from auth_service.app.models.user import User
from auth_service.app.core.security import verify_password, create_access_token, decode_token,create_refresh_token
from jose import JWTError

def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        ) 

    return user


def issue_tokens(user: User):
    access_token = create_access_token(
        subject=user.id,
        tenant_id=None,  # tenant selection comes later
        permissions=[],
        is_super_admin=user.is_super_admin
    )

    refresh_token = create_refresh_token(subject=user.id)

    return access_token, refresh_token


def refresh_access_token(db, refresh_token: str):
    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    access_token = create_access_token(
        subject=user.id,
        tenant_id=None,  # tenant selection later
        permissions=[],
        is_super_admin=user.is_super_admin
    )

    return access_token