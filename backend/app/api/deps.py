from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, select

from app.core.security import decode_token
from app.db.session import get_session
from app.models.auth import Permission, Role, RolePermission
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
):
    token = credentials.credentials if credentials else access_token
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = session.get(User, int(user_id))
    if not user or user.is_deleted or user.status != "ACTIVE":
        raise HTTPException(status_code=401, detail="User is not active")

    return user


def require_roles(*role_names: str) -> Callable:
    def dependency(
        user: User = Depends(get_current_user),
        session: Session = Depends(get_session),
    ):
        role = session.get(Role, user.role_id) if user.role_id else None
        if role and role.name == "Admin":
            return user
        if not role or role.name not in role_names:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user

    return dependency


def require_permissions(*permission_names: str) -> Callable:
    def dependency(
        user: User = Depends(get_current_user),
        session: Session = Depends(get_session),
    ):
        role = session.get(Role, user.role_id) if user.role_id else None
        if role and role.name == "Admin":
            return user
        if not role:
            raise HTTPException(status_code=403, detail="Permission denied")

        permissions = session.exec(
            select(Permission.name)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role_id == role.id)
        ).all()
        if not set(permission_names).issubset(set(permissions)):
            raise HTTPException(status_code=403, detail="Permission denied")
        return user

    return dependency
