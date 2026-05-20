from sqlmodel import Session, select
from fastapi import HTTPException
from app.models.user import User
from app.models.auth import Role, Permission, RolePermission
from app.core.security import create_access_token, create_refresh_token, decode_token, verify_password
def login_service(session: Session, email: str, password: str):
    user = session.exec(
        select(User).where(User.email == email)
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    role = session.exec(
        select(Role).where(Role.id == user.role_id)
    ).first()

    if isinstance(role, tuple):
        role = role[0]

    roles = [role.name] if role else []
    role_ids = [role.id] if role else []

    permissions = []

    if role_ids:
        permission_rows = session.exec(
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role_id.in_(role_ids))
        ).all()

        permissions = list(set(p.name for p in permission_rows))

    token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "accessToken": token,
        "refreshToken": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "roles": roles,
            "permissions": permissions,
        },
    }


def refresh_token_service(session: Session, refresh_token: str):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = session.get(User, int(user_id))
    if not user or user.is_deleted or user.status != "ACTIVE":
        raise HTTPException(status_code=401, detail="User is not active")

    role = session.exec(select(Role).where(Role.id == user.role_id)).first()
    roles = [role.name] if role else []
    permissions = []
    if role:
        permission_rows = session.exec(
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role_id == role.id)
        ).all()
        permissions = list(set(p.name for p in permission_rows))

    return {
        "accessToken": create_access_token({"sub": str(user.id)}),
        "refreshToken": create_refresh_token({"sub": str(user.id)}),
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "roles": roles,
            "permissions": permissions,
        },
    }
