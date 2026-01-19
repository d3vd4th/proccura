from sqlalchemy.orm import Session
from auth_service.app.models.permission import Permission

PERMISSIONS = [

    ("tenant.create", "Create tenants", "tenant"),
    ("tenant.update", "Update tenant details", "tenant"),
    ("tenant.read", "View tenant details", "tenant"),

    ("user.create", "Create users", "user"),
    ("user.update", "Update users", "user"),
    ("user.deactivate", "Deactivate users", "user"),
    ("user.read", "View users", "user"),

    ("role.create", "Create roles", "role"),
    ("role.update", "Update roles", "role"),
    ("role.read", "View roles", "role"),
    ("role.permission.update", "Assign permissions to roles", "role"),

    ("vendor.create", "Create vendors", "vendor"),
    ("vendor.update", "Update vendors", "vendor"),
    ("vendor.read", "View vendors", "vendor"),
    ("vendor.deactivate", "Deactivate vendors", "vendor"),

    ("po.create", "Create purchase orders", "po"),
    ("po.approve", "Approve purchase orders", "po"),
    ("po.read", "View purchase orders", "po"),

    ("report.view", "View reports", "report"),
    ("report.export", "Export reports", "report"),

    ("ai.insights.view", "View AI insights", "ai"),
]


def seed_permissions(db: Session):
    for code, description, feature in PERMISSIONS:
        exists = db.query(Permission).filter_by(code=code).first()
        if not exists:
            db.add(
                Permission(
                    code=code,
                    description=description,
                    feature=feature
                )
            )
    db.commit()
