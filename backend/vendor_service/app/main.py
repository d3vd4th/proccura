from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import invitations
from app.core.database import engine, Base

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

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "vendor_service"}
