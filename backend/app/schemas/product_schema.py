from pydantic import BaseModel
from typing import Optional, Dict


class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    category_id: Optional[int] = None


class ProductRead(BaseModel):
    id: int
    name: str
    sku: str
    price: float

    class Config:
        from_attributes = True