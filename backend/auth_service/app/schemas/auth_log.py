from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuthLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    action: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True
