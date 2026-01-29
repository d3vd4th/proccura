from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.auth import LoginRequest, RefreshTokenRequest, TokenResponse
from app.services.auth_service import authenticate_user, issue_tokens, refresh_access_token
from app.api.deps import get_db  

router = APIRouter()  

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    access_token, refresh_token = issue_tokens(user)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_super_admin": user.is_super_admin,
            "profile_pic_url": user.profile_pic_url,
            "tenant_id": user.tenant_id,
        },
        "access_token": access_token,
        "refresh_token": refresh_token
    }

@router.post("/refresh")
def refresh_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    access_token = refresh_access_token(db, payload.refresh_token)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/health")
def health_check():
    """Health check endpoint for API Gateway"""
    return {"status": "healthy", "service": "auth"}
