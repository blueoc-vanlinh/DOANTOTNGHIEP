from sqlmodel import Boolean, Column, Field
from app.db.base_model import BaseModel

class ExportOrder(BaseModel, table=True):
    __tablename__ = "export_orders"

    order_code: str | None = Field(default=None, unique=True, index=True)
    export_type: str = Field(default="RETAIL_SALE", index=True)
    customer_name: str
    total_amount: float
    tax_amount: float = 0
    grand_total: float = 0
    status: str
    created_by: int | None = Field(default=None, foreign_key="users.id")
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )




class ExportOrderItem(BaseModel, table=True):
    __tablename__ = "export_order_items"

    export_order_id: int = Field(foreign_key="export_orders.id")
    product_id: int = Field(foreign_key="products.id")
    warehouse_id: int | None = Field(default=None, foreign_key="warehouses.id")

    quantity: int
    price: float
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )
    
