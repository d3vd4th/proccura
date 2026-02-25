from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

# For requesting an assignment
class VendorQuestionnaireAssignCreate(BaseModel):
    domains: List[str]

# For output response
class VendorQuestionnaireAssignmentOut(BaseModel):
    id: UUID
    tenant_id: UUID
    pre_registration_id: UUID
    domain: str
    status: str
    assigned_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
