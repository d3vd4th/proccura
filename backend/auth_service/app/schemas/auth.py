from pydantic import BaseModel, EmailStr
from typing import Optional, List


class CheckEmailRequest(BaseModel):
    email: EmailStr


class TenantInfo(BaseModel):
    id: str
    name: str
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True


class CheckEmailResponse(BaseModel):
    user_exists: bool
    is_super_admin: bool = False
    tenants: List[TenantInfo] = []
    requires_password_reset: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_id: Optional[str] = None  # Optional for super admins


class UserLogin(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    is_super_admin: bool
    user_type: Optional[str] = "INTERNAL"
    profile_pic_url: Optional[str] = None
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    user: UserLogin
    access_token: str
    refresh_token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str