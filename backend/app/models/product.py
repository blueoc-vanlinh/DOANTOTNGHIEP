from typing import Optional, Dict
from sqlmodel import Boolean, Field
from sqlalchemy import JSON, Column
from datetime import datetime
from app.db.base_model import BaseModel

class Category(BaseModel, table=True):
    __tablename__ = "categories"
    name: str
    description: Optional[str] = None
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )


class Product(BaseModel, table=True):
    __tablename__ = "products"

    name: str
    sku: str = Field(unique=True)
    barcode: str | None = Field(default=None, unique=True)

    price: float
    category_id: int | None = Field(default=None, foreign_key="categories.id")

    brand: str | None = None
    unit: str | None = None

    weight: float | None = None
    dimensions: Optional[Dict] = Field(default=None, sa_column=Column(JSON, nullable=True))

    status: str = Field(default="ACTIVE")
    deleted_at: datetime | None = None
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )
    