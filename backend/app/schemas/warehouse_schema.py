from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema, PaginationMeta


class WarehouseBase(BaseSchema):
    name: str
    location: Optional[str] = None
    description: Optional[str] = None


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(BaseSchema):
    name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class WarehouseResponse(WarehouseBase):
    id: int
    created_at: datetime
    updated_at: datetime


class WarehouseListResponse(BaseModel):
    items: List[WarehouseResponse]
    meta: PaginationMeta