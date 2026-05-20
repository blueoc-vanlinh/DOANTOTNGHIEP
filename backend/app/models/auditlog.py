from typing import Dict, Optional
from sqlmodel import Field
from sqlalchemy import JSON, Boolean, Column
from app.db.base_model import BaseModel

class AuditLog(BaseModel, table=True):
    __tablename__ = "audit_logs"

    user_id: int | None = Field(default=None, foreign_key="users.id")
    action: str
    table_name: str
    record_id: int | None = None
    method: str | None = None
    path: str | None = None
    status_code: int | None = None
    success: bool = True
    ip_address: str | None = None
    user_agent: str | None = None
    description: str | None = None

    old_data: Optional[Dict] = Field(default=None, sa_column=Column(JSON, nullable=True))
    new_data: Optional[Dict] = Field(default=None, sa_column=Column(JSON, nullable=True))
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True)
    )
    
