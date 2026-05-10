from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.schemas.common import BaseSchema, PaginationMeta


class UserBase(BaseSchema):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseSchema):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    items: List[UserResponse]
    meta: PaginationMeta