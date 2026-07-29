from pydantic import BaseModel
from typing import Optional


class WelcomeEmailPayload(BaseModel):
    to_email: str
    first_name: str
    tenant_name: str = "Proccura"
    role_name: str = "User"


class InvitationEmailPayload(BaseModel):
    to_email: str
    business_name: str
    invitation_token: str
    tenant_name: str = "Proccura"


class RegistrationNotificationPayload(BaseModel):
    to_email: str
    vendor_name: str
    business_name: str
    tenant_name: str = "Proccura"
