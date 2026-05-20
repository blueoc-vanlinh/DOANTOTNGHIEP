from datetime import datetime
from typing import Any

from app.schemas.common import BaseSchema


class AuditLogRead(BaseSchema):
    id: int
    user_id: int | None = None
    user_name: str | None = None
    actor: str
    action: str
    table_name: str
    record_id: int | None = None
    method: str | None = None
    path: str | None = None
    status_code: int | None = None
    success: bool
    ip_address: str | None = None
    user_agent: str | None = None
    description: str | None = None
    old_data: dict[str, Any] | None = None
    new_data: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime


class AuditLogListResponse(BaseSchema):
    items: list[AuditLogRead]
    total: int
    page: int
    page_size: int
