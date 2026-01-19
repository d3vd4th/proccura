from fastapi import FastAPI
from auth_service.app.api.tenants import router as tenant_router
from auth_service.app.api.auth import router as auth_router
from auth_service.app.api.roles import router as role_router
from auth_service.app.api.users import router as user_router
# from auth_service.app.models.role import Role
# from shared.database import engine, Base

app = FastAPI(title="Proccura Auth Service")

app.include_router(tenant_router)
app.include_router(auth_router)
app.include_router(role_router)
app.include_router(user_router)

# Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "proccura auth service is healthy"}

