from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.notification_schema import NotificationSummary
from app.services.notification_service import (
    get_notifications,
    get_unread_count,
    mark_as_read,
)

router = APIRouter(tags=["Notifications"])


@router.get("/", response_model=NotificationSummary)
def list_my_notifications(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    items = get_notifications(session, current_user.id)
    return {
        "items": items,
        "unread_count": get_unread_count(session, current_user.id),
    }


@router.patch("/{notification_id}/read")
def read_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    notification = mark_as_read(session, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification
