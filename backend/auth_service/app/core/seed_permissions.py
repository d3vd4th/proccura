from sqlalchemy.orm import Session
from auth_service.app.models.permission import Permission

PERMISSIONS = [
    ("MANAGE_TENANT", "Create & update tenant details"),
    ("MANAGE_USERS", "Invite, update, deactivate users"),
    ("MANAGE_ROLES", "Create roles & assign permissions"),
    ("MANAGE_VENDORS", "Manage vendors"),
    ("CREATE_PO", "Create purchase orders"),
    ("APPROVE_PO", "Approve purchase orders"),
    ("VIEW_REPORTS", "View reports"),
    ("MANAGE_PAYMENTS", "Manage payments"),
]

def seed_permissions(db: Session):
    for code, description in PERMISSIONS:
        exists = db.query(Permission).filter_by(code=code).first()
        if not exists:
            db.add(Permission(code=code, description=description))
    db.commit()
