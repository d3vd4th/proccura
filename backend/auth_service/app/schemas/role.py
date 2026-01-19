from pydantic import BaseModel
from typing import List, Optional


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True


class RolePermissionUpdate(BaseModel):
    permission_ids: List[str]
 