from sqlalchemy.orm import Session
from app.models.permission import Permission
from app.models.feature import Feature


FEATURES = [
    ("tenant", "Tenant Management", "Manage tenants and organizations"),
    ("user", "User Management", "Manage users and their accounts"),
    ("role", "Role Management", "Manage roles and permissions"),
    ("vendor", "Vendor Management", "Manage vendors and suppliers"),
    ("po", "Purchase Orders", "Manage purchase orders"),
    ("report", "Reports", "View and export reports"),
    ("ai", "AI Features", "AI-powered insights and features"),
]

PERMISSIONS = [
    ("tenant.create", "Create tenants", "tenant"),
    ("tenant.update", "Update tenant details", "tenant"),
    ("tenant.read", "View tenant details", "tenant"),

    ("user.create", "Create users", "user"),
    ("user.update", "Update users", "user"),
    ("user.delete", "Delete users", "user"),
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


def seed_features(db: Session):
    """Seed features into database"""
    feature_map = {}
    
    for code, name, description in FEATURES:
        feature = db.query(Feature).filter_by(code=code).first()
        if not feature:
            feature = Feature(
                code=code,
                name=name,
                description=description
            )
            db.add(feature)
            db.flush()
        feature_map[code] = feature.id
    
    db.commit()
    print("✔ Features seeded")
    return feature_map


def seed_permissions(db: Session):
    """Seed features and permissions into database"""
    # First seed features and get the mapping
    feature_map = seed_features(db)
    
    # Then seed permissions with feature_id reference
    for code, description, feature_code in PERMISSIONS:
        exists = db.query(Permission).filter_by(code=code).first()
        if not exists:
            db.add(
                Permission(
                    code=code,
                    description=description,
                    feature_id=feature_map.get(feature_code)
                )
            )
        else:
            # Update existing permission with feature_id if not set
            if not exists.feature_id and feature_code in feature_map:
                exists.feature_id = feature_map.get(feature_code)
    
    db.commit()
    print("✔ Permissions seeded")
