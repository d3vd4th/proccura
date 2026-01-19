from sqlalchemy.orm import Session
from auth_service.app.models.role import Role
from auth_service.app.models.role_permission import RolePermission


def create_role(db: Session, tenant_id: str, payload):
    role = Role(
        tenant_id=tenant_id,
        name=payload.name,
        description=payload.description,
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def list_roles(db: Session, tenant_id: str):
    return (
        db.query(Role)
        .filter(Role.tenant_id == tenant_id)
        .order_by(Role.created_at.desc())
        .all()
    )


def update_role(db: Session, role: Role, payload):
    if payload.name is not None:
        role.name = payload.name
    if payload.description is not None:
        role.description = payload.description

    db.commit()
    db.refresh(role)
    return role


def replace_role_permissions(
    db: Session,
    role_id: str,
    permission_ids: list[str],
):
    # delete old mappings
    db.query(RolePermission).filter(
        RolePermission.role_id == role_id
    ).delete()

    # add new mappings
    for pid in permission_ids:
        db.add(
            RolePermission(
                role_id=role_id,
                permission_id=pid,
            )
        )

    db.commit()
