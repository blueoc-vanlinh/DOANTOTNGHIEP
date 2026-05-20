from datetime import datetime

from app.schemas.common import BaseSchema


class NotificationRead(BaseSchema):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    updated_at: datetime


class NotificationSummary(BaseSchema):
    items: list[NotificationRead]
    unread_count: int
