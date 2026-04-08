from datetime import datetime, timezone
from sqlmodel import Column, Field
from sqlalchemy import Boolean, UniqueConstraint
from app.db.base_model import BaseModel

class Inventory(BaseModel, table=True):
    __tablename__ = "inventory"
    __table_args__ = (UniqueConstraint("product_id", "warehouse_id", name="uq_inventory_product_warehouse"),)

    product_id: int = Field(foreign_key="products.id")
    warehouse_id: int = Field(foreign_key="warehouses.id")

    quantity: int = 0
    reserved_quantity: int = 0
    oncoming_quantity: int = 0

    min_threshold: int = 10

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )

