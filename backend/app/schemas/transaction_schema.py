from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema, PaginationMeta


TransactionType = Literal["IMPORT", "EXPORT", "ADJUST"]


class TransactionBase(BaseSchema):
    product_id: int
    warehouse_id: int

    quantity: int
    type: TransactionType

    reference_type: Optional[str] = None
    reference_id: Optional[int] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseSchema):
    quantity: Optional[int] = None
    type: Optional[TransactionType] = None


class TransactionResponse(TransactionBase):
    id: int

    product_name: str
    warehouse_name: str

    balance_after: int

    created_by: Optional[int] = None

    created_at: datetime


class TransactionListResponse(BaseModel):
    items: List[TransactionResponse]
    meta: PaginationMeta