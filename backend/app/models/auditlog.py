from typing import Dict, Optional
from sqlmodel import Field
from sqlalchemy import JSON, Column
from app.db.base_model import BaseModel

class AuditLog(BaseModel, table=True):
    __tablename__ = "audit_logs"

    user_id: int = Field(foreign_key="users.id")
    action: str
    table_name: str
    record_id: int

    old_data: Optional[Dict] = Field(default=None, sa_column=Column(JSON, nullable=True))
    new_data: Optional[Dict] = Field(default=None, sa_column=Column(JSON, nullable=True))