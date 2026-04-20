from sqlmodel import Boolean, Column, SQLModel, Field

class Role(SQLModel, table=True):
    __tablename__ = "roles"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(sa_column_kwargs={"unique": True}, nullable=False)
    is_deleted: bool = Field(default=False, index=True)

class Permission(SQLModel, table=True):
    __tablename__ = "permissions"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(sa_column_kwargs={"unique": True}, nullable=False)
    is_deleted: bool = Field(default=False, index=True)

class RolePermission(SQLModel, table=True):
    __tablename__ = "role_permissions"
    role_id: int = Field(foreign_key="roles.id", primary_key=True)
    permission_id: int = Field(foreign_key="permissions.id", primary_key=True)
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )
class UserRole(SQLModel, table=True):
    __tablename__ = "user_roles"
    user_id: int = Field(foreign_key="users.id", primary_key=True)
    role_id: int = Field(foreign_key="roles.id", primary_key=True)