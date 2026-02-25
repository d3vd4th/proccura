from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.endpoints import (
    invitations,
    registration,
    pre_registrations,
    questionnaires
)
# Import all models so Base.metadata.create_all picks them up
from app.models.invitation import Invitation  # noqa: F401
from app.models.vendor_pre_registration import VendorPreRegistration  # noqa: F401
from app.models.questionnaire import Questionnaire  # noqa: F401
from app.models.vendor_questionnaire_assignment import VendorQuestionnaireAssignment  # noqa: F401

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Proccura Vendor Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invitations.router, prefix="/api/v1/invitations", tags=["Invitations"])
app.include_router(pre_registrations.router, prefix="/api/v1/pre-registrations", tags=["PreRegistrations"])
app.include_router(registration.router, prefix="/api/v1/register", tags=["Registration (Public)"])
app.include_router(questionnaires.router, prefix="/api/v1/questionnaires", tags=["Questionnaires"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "vendor_service"}
