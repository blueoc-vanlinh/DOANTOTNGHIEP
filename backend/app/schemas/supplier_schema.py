from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.schemas.common import BaseSchema, PaginationMeta


class SupplierBase(BaseSchema):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseSchema):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None


class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime
    updated_at: datetime


class SupplierListResponse(BaseModel):
    items: List[SupplierResponse]
    meta: PaginationMeta
