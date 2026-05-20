from app.models.auth import Permission, Role, RolePermission
from app.models.user import User


def test_admin_role_can_hold_all_permissions(session):
    admin = Role(name="Admin")
    permissions = [Permission(name="manage_users"), Permission(name="view_reports")]
    session.add(admin)
    session.add_all(permissions)
    session.commit()
    session.refresh(admin)
    for permission in permissions:
        session.refresh(permission)
        session.add(RolePermission(role_id=admin.id, permission_id=permission.id))
    session.add(User(name="Admin", email="admin@example.com", password="x", role_id=admin.id))
    session.commit()

    rows = session.query(RolePermission).filter(RolePermission.role_id == admin.id).all()

    assert len(rows) == 2
