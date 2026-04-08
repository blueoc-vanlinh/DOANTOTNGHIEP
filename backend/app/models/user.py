from sqlmodel import Boolean, Column, Field
from datetime import datetime
from app.db.base_model import BaseModel

class User(BaseModel, table=True):
    __tablename__ = "users"

    name: str | None = None
    email: str = Field(unique=True, index=True, nullable=False)
    password: str
    role_id: int | None = Field(default=None, foreign_key="roles.id")

    status: str = Field(default="ACTIVE")
    deleted_at: datetime | None = None
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )
    