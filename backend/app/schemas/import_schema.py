from pydantic import BaseModel


class ImportItem(BaseModel):
    product_id: int

    warehouse_id: int

    quantity: int

    unit_cost: float


class ImportCreate(BaseModel):
    supplier_id: int
    vat_rate: float = 0.08

    items: list[ImportItem]
