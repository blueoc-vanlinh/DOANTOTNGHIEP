from sqlmodel import Field
from sqlalchemy import Boolean, Column

from app.db.base_model import BaseModel

class Warehouse(BaseModel, table=True):
    __tablename__ = "warehouses"

    name: str
    location: str | None = None
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )
    