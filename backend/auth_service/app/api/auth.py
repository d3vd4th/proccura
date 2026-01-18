from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from shared.database import SessionLocal
from auth_service.app.schemas.auth import LoginRequest, RefreshTokenRequest, TokenResponse
from auth_service.app.services.auth_service import authenticate_user, issue_tokens, refresh_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    access_token, refresh_token = issue_tokens(user)

    return {
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