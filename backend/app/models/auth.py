from sqlmodel import SQLModel, Field

class Role(SQLModel, table=True):
    __tablename__ = "roles"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(sa_column_kwargs={"unique": True}, nullable=False)

class Permission(SQLModel, table=True):
    __tablename__ = "permissions"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(sa_column_kwargs={"unique": True}, nullable=False)

class RolePermission(SQLModel, table=True):
    __tablename__ = "role_permissions"
    role_id: int = Field(foreign_key="roles.id", primary_key=True)
    permission_id: int = Field(foreign_key="permissions.id", primary_key=True)