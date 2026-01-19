from fastapi import APIRouter
from auth_service.app.api.v1.endpoints import auth, roles, tenants, users

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["Tenants"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])