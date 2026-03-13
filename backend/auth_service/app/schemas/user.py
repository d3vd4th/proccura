from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: Optional[str] = None
    password: str
    role_id: str
    profile_pic_url: Optional[str] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    profile_pic_url: Optional[str] = None
    role_id: Optional[str] = None
    status: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    profile_pic_url: Optional[str] = None
    role_id: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True
