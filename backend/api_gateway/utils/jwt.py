import jwt
from datetime import datetime
from fastapi import HTTPException, status
from api_gateway.config import settings


def verify_token(token: str) -> dict:
    """
    Verify JWT token and return payload.
    Raises HTTPException if token is invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def extract_token_from_header(authorization: str) -> str:
    """Extract token from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    parts = authorization.split()
    
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    return parts[1]


def get_user_from_token(authorization: str) -> dict:
    """
    Extract and verify user info from JWT token.
    Returns user payload if valid.
    """
    token = extract_token_from_header(authorization)
    payload = verify_token(token)
    return payload