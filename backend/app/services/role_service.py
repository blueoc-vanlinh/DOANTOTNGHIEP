from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.auth import Permission, Role, RolePermission


def list_permissions(session: Session):
    return session.exec(
        select(Permission)
        .where(Permission.is_deleted.is_(False))
        .order_by(Permission.name)
    ).all()


def list_roles(session: Session):
    roles = session.exec(
        select(Role)
        .where(Role.is_deleted.is_(False))
        .order_by(Role.id)
    ).all()
    return [_role_with_permissions(session, role) for role in roles]


def create_role(session: Session, data: dict):
    existing = session.exec(
        select(Role).where(Role.name == data["name"], Role.is_deleted.is_(False))
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role already exists")

    role = Role(name=data["name"])
    session.add(role)
    session.flush()
    _replace_role_permissions(session, role.id, data.get("permission_ids", []))
    session.commit()
    session.refresh(role)
    return _role_with_permissions(session, role)


def update_role(session: Session, role_id: int, data: dict):
    role = session.get(Role, role_id)
    if not role or role.is_deleted:
        raise HTTPException(status_code=404, detail="Role not found")

    if data.get("name"):
        role.name = data["name"]

    if data.get("permission_ids") is not None:
        _replace_role_permissions(session, role.id, data["permission_ids"])

    session.add(role)
    session.commit()
    session.refresh(role)
    return _role_with_permissions(session, role)


def delete_role(session: Session, role_id: int):
    role = session.get(Role, role_id)
    if not role or role.is_deleted:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.name == "Admin":
        raise HTTPException(status_code=400, detail="Admin role cannot be deleted")

    role.is_deleted = True
    session.add(role)
    session.commit()
    return {"message": "Role deleted successfully"}


def _replace_role_permissions(session: Session, role_id: int, permission_ids: list[int]):
    existing = session.exec(
        select(RolePermission).where(RolePermission.role_id == role_id)
    ).all()
    for item in existing:
        session.delete(item)

    for permission_id in permission_ids:
        permission = session.get(Permission, permission_id)
        if permission and not permission.is_deleted:
            session.add(RolePermission(role_id=role_id, permission_id=permission_id))


def _role_with_permissions(session: Session, role: Role):
    permissions = session.exec(
        select(Permission)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(
            RolePermission.role_id == role.id,
            Permission.is_deleted.is_(False),
        )
        .order_by(Permission.name)
    ).all()
    return {
        "id": role.id,
        "name": role.name,
        "permissions": permissions,
    }
