from sqlmodel import Field

from sqlalchemy import Boolean, Column

from app.db.base_model import BaseModel

class Supplier(BaseModel, table=True):
    __tablename__ = "suppliers"

    name: str
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )
    