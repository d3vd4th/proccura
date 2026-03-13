from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


class VendorUserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: Optional[str] = None
    is_primary: bool = False


class VendorUserOut(BaseModel):
    id: UUID
    registration_id: UUID
    auth_user_id: str
    email: str
    first_name: str
    last_name: Optional[str] = None
    is_primary: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
