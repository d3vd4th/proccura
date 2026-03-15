from sqlalchemy.orm import Session
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.permission import Permission


def _sync_role_permissions(db: Session, role_id: str, permission_codes: list[str]):
    """Sync role permissions by permission codes"""
    # Delete existing permissions
    db.query(RolePermission).filter(
        RolePermission.role_id == role_id
    ).delete()

    if not permission_codes:
        return

    # Get permission IDs from codes
    permissions = (
        db.query(Permission)
        .filter(Permission.code.in_(permission_codes))
        .all()
    )

    # Add new mappings
    for perm in permissions:
        db.add(
            RolePermission(
                role_id=role_id,
                permission_id=perm.id,
            )
        )


def _get_role_permission_codes(db: Session, role_id: str) -> list[str]:
    """Get list of permission codes for a role"""
    results = (
        db.query(Permission.code)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role_id == role_id)
        .all()
    )
    return [r[0] for r in results]


def create_role(db: Session, tenant_id: str, payload):
    role = Role(
        tenant_id=tenant_id,
        name=payload.name,
        description=payload.description,
    )
    db.add(role)
    db.flush()  # Get role.id without committing

    # Handle permissions if provided
    if payload.permissions:
        _sync_role_permissions(db, role.id, payload.permissions)

    db.commit()
    db.refresh(role)

    # Attach permissions to response
    role.permissions = _get_role_permission_codes(db, role.id)
    return role


def list_roles(db: Session, tenant_id: str):
    roles = (
        db.query(Role)
        .filter(Role.tenant_id == tenant_id,
        Role.name !="Vendor")
        .order_by(Role.created_at.desc())
        .all()
    )

    # Attach permissions to each role
    for role in roles:
        role.permissions = _get_role_permission_codes(db, role.id)

    return roles


def update_role(db: Session, role: Role, payload):
    if payload.name is not None:
        role.name = payload.name
    if payload.description is not None:
        role.description = payload.description

    # Handle permissions if provided
    if payload.permissions is not None:
        _sync_role_permissions(db, role.id, payload.permissions)

    db.commit()
    db.refresh(role)

    # Attach permissions to response
    role.permissions = _get_role_permission_codes(db, role.id)
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
