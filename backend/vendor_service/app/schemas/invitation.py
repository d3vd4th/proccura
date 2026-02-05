from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

class InvitationBase(BaseModel):
    business_name: str
    email: EmailStr

class InvitationCreate(InvitationBase):
    pass

class InvitationOut(InvitationBase):
    id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
