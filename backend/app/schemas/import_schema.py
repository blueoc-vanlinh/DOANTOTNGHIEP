from pydantic import BaseModel
from typing import List

class ImportItem(BaseModel):
    product_id: int
    quantity: int
    unit_cost: float

class ImportCreate(BaseModel):
    supplier_id: int
    warehouse_id: int
    items: List[ImportItem]