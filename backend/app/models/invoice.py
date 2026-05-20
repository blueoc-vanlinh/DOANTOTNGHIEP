from datetime import datetime

from sqlalchemy import Boolean, Column
from sqlmodel import Field

from app.db.base_model import BaseModel


class Invoice(BaseModel, table=True):
    __tablename__ = "invoices"

    invoice_number: str = Field(unique=True, index=True)
    invoice_type: str = Field(index=True)  # IMPORT, EXPORT
    order_id: int = Field(index=True)
    partner_name: str
    total_amount: float = 0
    tax_amount: float = 0
    discount_amount: float = 0
    grand_total: float = 0
    status: str = "ISSUED"
    payment_status: str = "UNPAID"
    momo_trans_id: str | None = None
    issued_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: int | None = Field(default=None, foreign_key="users.id")
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True),
    )


class InvoiceItem(BaseModel, table=True):
    __tablename__ = "invoice_items"

    invoice_id: int = Field(foreign_key="invoices.id")
    product_id: int = Field(foreign_key="products.id")
    description: str | None = None
    quantity: int
    unit_price: float
    line_total: float
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True),
    )
