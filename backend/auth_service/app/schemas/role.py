from pydantic import BaseModel
from typing import List, Optional


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[List[str]] = None  # List of permission codes


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None  # List of permission codes


class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    permissions: List[str] = []  # List of permission codes

    class Config:
        from_attributes = True


class RolePermissionUpdate(BaseModel):
    permission_ids: List[str]
 