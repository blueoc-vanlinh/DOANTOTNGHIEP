from sqlmodel import Field
from app.db.base_model import BaseModel

class ExportOrder(BaseModel, table=True):
    __tablename__ = "export_orders"

    customer_name: str
    total_amount: float
    status: str
    created_by: int | None = Field(default=None, foreign_key="users.id")


class ExportOrderItem(BaseModel, table=True):
    __tablename__ = "export_order_items"

    export_order_id: int = Field(foreign_key="export_orders.id")
    product_id: int = Field(foreign_key="products.id")

    quantity: int
    price: float