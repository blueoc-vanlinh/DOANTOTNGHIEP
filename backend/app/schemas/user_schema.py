from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.schemas.common import BaseSchema, PaginationMeta


class UserBase(BaseSchema):
    name: str
    email: EmailStr
    role_id: Optional[int] = None
    status: str = "ACTIVE"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseSchema):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None
    status: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    items: List[UserResponse]
    meta: PaginationMeta
