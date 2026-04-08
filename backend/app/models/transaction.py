from sqlalchemy import Boolean, CheckConstraint
from sqlmodel import Boolean, Column, Field
from app.db.base_model import BaseModel

class StockTransaction(BaseModel, table=True):
    __tablename__ = "stock_transactions"
    __table_args__ = (
        CheckConstraint("type IN ('IMPORT', 'EXPORT', 'ADJUST')", name="ck_stock_transactions_type"),
    )

    product_id: int = Field(foreign_key="products.id")
    warehouse_id: int = Field(foreign_key="warehouses.id")

    type: str = Field(nullable=False)
    quantity: int

    balance_after: int

    reference_type: str | None = None
    reference_id: int | None = None

    created_by: int | None = Field(default=None, foreign_key="users.id")
    note: str | None = None
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )
    