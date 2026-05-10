from typing import Optional, Dict, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema, PaginationMeta


class ProductBase(BaseSchema):
    name: str
    sku: str
    barcode: Optional[str] = None

    price: float

    category_id: Optional[int] = None

    brand: Optional[str] = None
    unit: Optional[str] = None

    weight: Optional[float] = None
    dimensions: Optional[Dict] = None

    status: str = "ACTIVE"


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseSchema):
    name: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    unit: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[Dict] = None
    status: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    category_name: Optional[str] = None

    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    meta: PaginationMeta