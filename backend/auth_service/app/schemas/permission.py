from pydantic import BaseModel
from typing import Optional, List


class FeatureResponse(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class PermissionResponse(BaseModel):
    id: str
    code: str
    description: Optional[str] = None
    feature_id: Optional[str] = None

    class Config:
        from_attributes = True


class PermissionWithFeatureResponse(BaseModel):
    id: str
    code: str
    description: Optional[str] = None
    feature: Optional[FeatureResponse] = None

    class Config:
        from_attributes = True


class FeatureWithPermissionsResponse(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True
