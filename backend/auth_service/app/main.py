from fastapi import FastAPI
from shared.database import Base, engine
from auth_service.app.models.tenant import Tenant
from auth_service.app.models.user import User
from auth_service.app.models.role import Role
from auth_service.app.models.permission import Permission
from auth_service.app.models.role_permission import RolePermission
from auth_service.app.models.tenant_user import TenantUser
from auth_service.app.models.auth_log import AuthLog
from auth_service.app.models.audit_log import AuditLog

app = FastAPI(title="Proccura Auth Service")

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "proccura's auth service is healthy"}
