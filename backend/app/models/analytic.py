import datetime as dt
from sqlmodel import Field
from sqlalchemy import UniqueConstraint
from app.db.base_model import BaseModel


class DailyInventoryStats(BaseModel, table=True):
    __tablename__ = "daily_inventory_stats"

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "warehouse_id",
            "date",
            name="uq_daily_inventory"
        ),
    )

    product_id: int = Field(foreign_key="products.id")
    warehouse_id: int = Field(foreign_key="warehouses.id")

    date: dt.date = Field(index=True)
    opening_stock: int
    closing_stock: int
    total_import: int = 0
    total_export: int = 0
    inventory_value: float