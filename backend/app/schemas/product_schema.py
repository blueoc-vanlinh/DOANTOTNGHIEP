from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, List
from datetime import datetime


class CategoryRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    status: str = "ACTIVE"
    dimensions: Optional[Dict] = None
    weight: Optional[float] = None


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    id: int
    category: Optional[CategoryRead] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_deleted: bool = False

    model_config = ConfigDict(from_attributes=True)


class ProductsResponse(BaseModel):
    items: List[ProductRead]
    total: int
    page: int
    page_size: int