from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class VendorApproverAssign(BaseModel):
    approver_id: str

class VendorOut(BaseModel):
    id: UUID
    tenant_id: UUID
    registration_id: Optional[UUID] = None
    business_name: str
    contact_person: str
    contact_person_email: Optional[str] = None
    email: EmailStr
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    business_type: Optional[str] = None
    products_services: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PaginatedVendors(BaseModel):
    items: List[VendorOut]
    total: int
    page: int
    limit: int
    total_pages: int
