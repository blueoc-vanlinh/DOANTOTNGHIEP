from app.core.security import hash_password
from app.models.auth import Permission, Role, RolePermission
from app.models.user import User
from app.services.auth_service import login_service, refresh_token_service


def test_login_returns_access_and_refresh_tokens(session):
    role = Role(name="Admin")
    permission = Permission(name="manage_users")
    session.add(role)
    session.add(permission)
    session.commit()
    session.refresh(role)
    session.refresh(permission)
    session.add(RolePermission(role_id=role.id, permission_id=permission.id))
    session.add(
        User(
            name="Admin",
            email="admin@example.com",
            password=hash_password("secret123"),
            role_id=role.id,
            status="ACTIVE",
        )
    )
    session.commit()

    result = login_service(session, "admin@example.com", "secret123")

    assert result["accessToken"]
    assert result["refreshToken"]
    assert result["user"]["roles"] == ["Admin"]
    assert "manage_users" in result["user"]["permissions"]

    refreshed = refresh_token_service(session, result["refreshToken"])
    assert refreshed["accessToken"]
    assert refreshed["refreshToken"]
