from typing import List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema, PaginationMeta


class InventoryBase(BaseSchema):
    product_id: int
    warehouse_id: int
    quantity: int


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseSchema):
    quantity: int


class InventoryResponse(InventoryBase):
    id: int

    product_name: str
    warehouse_name: str

    created_at: datetime
    updated_at: datetime


class InventoryListResponse(BaseModel):
    items: List[InventoryResponse]
    meta: PaginationMeta