from sqlalchemy.orm import Session
from auth_service.app.models.tenant import Tenant


def create_tenant(db: Session, data):
    tenant = Tenant(**data.dict())
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant


def update_tenant(db: Session, tenant: Tenant, data):
    for key, value in data.dict(exclude_unset=True).items():
        setattr(tenant, key, value)
    db.commit()
    db.refresh(tenant)
    return tenant


def get_tenant(db: Session, tenant_id: str):
    return db.query(Tenant).filter(Tenant.id == tenant_id).first()


def list_tenants(db: Session):
    return db.query(Tenant).order_by(Tenant.created_at.desc()).all()
