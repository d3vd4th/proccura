from datetime import datetime, timedelta
from typing import Optional

from passlib.context import CryptContext
from jose import jwt
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15)
)
REFRESH_TOKEN_EXPIRE_DAYS = int(
    os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7)
)

def hash_password(password: str) -> str:
    """
    Hash password safely for bcrypt (max 72 bytes).
    """
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        password = password_bytes[:72].decode("utf-8", errors="ignore")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a bcrypt hash.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(
    subject: str,
    tenant_id: Optional[str],
    permissions: list[str],
    is_super_admin: bool
) -> str:
    """
    Create short-lived access token.
    """
    payload = {
        "sub": subject,
        "tenant_id": tenant_id,
        "permissions": permissions,
        "is_super_admin": is_super_admin,
        "type": "access",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str) -> str:
    """
    Create long-lived refresh token.
    """
    payload = {
        "sub": subject,
        "type": "refresh",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and validate JWT.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
