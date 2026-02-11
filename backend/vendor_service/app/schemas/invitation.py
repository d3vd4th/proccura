from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional, List


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


class PaginatedInvitations(BaseModel):
    items: List[InvitationOut]
    total: int
    page: int
    limit: int
    total_pages: int


# --- Pre-Registration Schemas ---

class InvitationVerifyOut(BaseModel):
    """Returned when a vendor clicks the invitation link."""
    business_name: str
    email: str
    status: str

    class Config:
        from_attributes = True


class VendorPreRegistrationCreate(BaseModel):
    """Vendor fills this form during pre-registration."""
    business_name: str
    contact_person: str
    email: EmailStr
    phone: str

    # Address
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str

    # Business details
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    business_type: Optional[str] = None
    products_services: Optional[str] = None


class VendorPreRegistrationOut(BaseModel):
    id: UUID
    invitation_id: UUID
    business_name: str
    contact_person: str
    email: str
    phone: str
    city: str
    state: str
    country: str
    business_type: Optional[str] = None
    created_at: datetime


class PaginatedVendorPreRegistrations(BaseModel):
    items: List[VendorPreRegistrationOut]
    total: int
    page: int
    limit: int
    total_pages: int
