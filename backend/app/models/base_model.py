# app/db/base_model.py
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Boolean
from datetime import datetime
from typing import Optional

class BaseModel(SQLModel):
    """Base model với hỗ trợ Soft Delete (is_deleted)"""

    id: Optional[int] = Field(default=None, primary_key=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )
    
    class Config:
        arbitrary_types_allowed = True