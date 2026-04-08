from sqlmodel import Boolean, Column, Field
from app.db.base_model import BaseModel


class ImportOrder(BaseModel, table=True):
    __tablename__ = "import_orders"

    supplier_id: int = Field(foreign_key="suppliers.id")
    total_amount: float
    status: str  # PENDING, COMPLETED, CANCELLED

    created_by: int | None = Field(default=None, foreign_key="users.id")
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )



class ImportOrderItem(BaseModel, table=True):
    __tablename__ = "import_order_items"

    import_order_id: int = Field(
        foreign_key="import_orders.id"
    )
    product_id: int = Field(
        foreign_key="products.id"
    )

    quantity: int
    unit_cost: float
