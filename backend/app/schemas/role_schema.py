from pydantic import BaseModel


class PermissionRead(BaseModel):
    id: int
    name: str


class RoleCreate(BaseModel):
    name: str
    permission_ids: list[int] = []


class RoleUpdate(BaseModel):
    name: str | None = None
    permission_ids: list[int] | None = None


class RoleRead(BaseModel):
    id: int
    name: str
    permissions: list[PermissionRead] = []
