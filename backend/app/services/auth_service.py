from sqlmodel import Session, select
from fastapi import HTTPException
from app.models.user import User
from app.models.auth import Role, Permission, RolePermission
from app.core.security import verify_password, create_access_token
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

    return {
        "accessToken": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "roles": roles,
            "permissions": permissions,
        },
    }
