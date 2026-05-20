from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


InvoiceType = Literal["IMPORT", "EXPORT"]


class InvoiceItemCreate(BaseModel):
    product_id: int
    description: str | None = None
    quantity: int
    unit_price: float


class InvoiceCreate(BaseModel):
    invoice_type: InvoiceType
    order_id: int
    partner_name: str
    tax_amount: float = 0
    discount_amount: float = 0
    items: list[InvoiceItemCreate]


class InvoiceItemRead(BaseModel):
    id: int
    product_id: int
    description: str | None = None
    quantity: int
    unit_price: float
    line_total: float

    model_config = ConfigDict(from_attributes=True)


class InvoiceRead(BaseModel):
    id: int
    invoice_number: str
    invoice_type: str
    order_id: int
    partner_name: str
    total_amount: float
    tax_amount: float
    discount_amount: float
    grand_total: float
    status: str
    issued_at: datetime
    created_by: int | None = None
    items: list[InvoiceItemRead] = []

    model_config = ConfigDict(from_attributes=True)
