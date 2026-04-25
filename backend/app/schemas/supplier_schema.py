from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[EmailStr] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[EmailStr] = None


class SupplierOut(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    email: Optional[str]
    is_deleted: bool

    class Config:
        from_attributes = True  # 👈 SQLModel support

class SupplierListResponse(BaseModel):
    items: list[SupplierOut]
    meta: dict