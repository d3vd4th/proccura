from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        password = password_bytes[:72].decode("utf-8", errors="ignore")
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(
    subject: str,
    is_super_admin: bool,
    # tenant_id: Optional[str] = None,
    role_id: Optional[str] = None,
    user_type: Optional[str] = "INTERNAL",
) -> str:
    """
    Create access token with tenant and role context.
    """
    payload = {
        "sub": subject,
        "is_super_admin": is_super_admin,
        # "tenant_id": tenant_id,
        "role_id": role_id,
        "user_type": user_type,
        "type": "access",
        "exp": datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(
    subject: str,
    # tenant_id: Optional[str] = None,
    role_id: Optional[str] = None
) -> str:
    """
    Create refresh token with context.
    """
    payload = {
        "sub": subject,
        # "tenant_id": tenant_id,
        "role_id": role_id,
        "type": "refresh",
        "exp": datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

def create_password_reset_token(email: str) -> str:
    """
    Create a token specifically for password reset.
    """
    payload = {
        "sub": email,
        "type": "password_reset",
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
