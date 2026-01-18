from fastapi import FastAPI

from auth_service.app.api.tenants import router as tenant_router
from auth_service.app.api.auth import router as auth_router

app = FastAPI(title="Proccura Auth Service")

app.include_router(tenant_router)
app.include_router(auth_router)

@app.get("/health")
def health():
    return {"status": "proccura auth service is healthy"}

