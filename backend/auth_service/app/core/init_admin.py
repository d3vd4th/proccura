from shared.database import SessionLocal
from auth_service.app.core.seed_permissions import seed_permissions
from auth_service.app.models.user import User
from shared.security import hash_password


SUPER_ADMIN_EMAIL = "admin@proccura.ai"
SUPER_ADMIN_PASSWORD = "admin@proccura.ai"


def create_super_admin(db):
    admin = db.query(User).filter(User.email == SUPER_ADMIN_EMAIL).first()
    if admin:
        print("✔ Super admin already exists")
        return

    admin = User(
        email=SUPER_ADMIN_EMAIL,
        first_name="System",
        last_name="Adminastrator",
        password_hash=hash_password(SUPER_ADMIN_PASSWORD),
        is_super_admin=True,
        is_active=True
    )
    db.add(admin)
    db.commit()
    print("✔ Super admin created and permissions assigned")


def run():
    db = SessionLocal()
    try:
        seed_permissions(db)
        # seed_role_templates(db)
        create_super_admin(db)
        print("✅ Platform initialization complete")
    finally:
        db.close()


if __name__ == "__main__":
    run()
