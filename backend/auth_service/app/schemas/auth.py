from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    is_super_admin: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    user: UserLogin
    access_token: str
    refresh_token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str