from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema, PaginationMeta


class CategoryBase(BaseSchema):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseSchema):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime


class CategoryListResponse(BaseModel):
    items: List[CategoryResponse]
    meta: PaginationMeta