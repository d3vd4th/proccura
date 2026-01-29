from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role_id: str
    profile_pic_url: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    profile_pic_url: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    is_active: bool
    profile_pic_url: Optional[str] = None

    class Config:
        from_attributes = True
