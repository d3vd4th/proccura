from fastapi import FastAPI
from auth_service.app.api.v1.api import api_router
# from shared.database import engine, Base

# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Auth Service",
    version="1.0.0",
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "healthy"}