from datetime import datetime, timezone

from sqlmodel import Session, select
from app.models.notification import Notification


def create_notification(
    session: Session,
    user_id: int,
    title: str,
    message: str,
) -> Notification:
    notification = Notification(user_id=user_id, title=title, message=message)
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


def get_notifications(session: Session, user_id: int):
    return session.exec(
        select(Notification)
        .where(Notification.user_id == user_id, Notification.is_deleted.is_(False))
        .order_by(Notification.created_at.desc())
    ).all()


def get_unread_count(session: Session, user_id: int) -> int:
    return len(
        session.exec(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
                Notification.is_deleted.is_(False),
            )
        ).all()
    )


def mark_as_read(session: Session, notification_id: int, user_id: int):
    noti = session.get(Notification, notification_id)
    if not noti or noti.user_id != user_id or noti.is_deleted:
        return None

    noti.is_read = True
    noti.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(noti)
    return noti
