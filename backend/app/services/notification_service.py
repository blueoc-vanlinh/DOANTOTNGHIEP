from sqlmodel import Session, select
from app.models.notification import Notification


def get_notifications(session: Session, user_id: int):
    return session.exec(
        select(Notification).where(Notification.user_id == user_id)
    ).all()


def mark_as_read(session: Session, notification_id: int):
    noti = session.get(Notification, notification_id)
    if not noti:
        return None

    noti.is_read = True
    session.commit()
    return noti