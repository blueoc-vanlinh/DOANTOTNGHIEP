from app.models.notification import Notification
from app.models.user import User
from app.services.notification_service import (
    get_notifications,
    get_unread_count,
    mark_as_read,
)


def test_notifications_are_scoped_to_user_and_ignore_deleted(session):
    user = User(name="A", email="a@example.com", password="hash", status="ACTIVE")
    other = User(name="B", email="b@example.com", password="hash", status="ACTIVE")
    session.add(user)
    session.add(other)
    session.commit()
    session.refresh(user)
    session.refresh(other)

    unread = Notification(user_id=user.id, title="Low stock", message="Product A is low")
    read = Notification(
        user_id=user.id,
        title="Done",
        message="Import order completed",
        is_read=True,
    )
    deleted = Notification(
        user_id=user.id,
        title="Hidden",
        message="Should not show",
        is_deleted=True,
    )
    other_user = Notification(
        user_id=other.id,
        title="Other",
        message="Should not show",
    )
    session.add_all([unread, read, deleted, other_user])
    session.commit()
    session.refresh(unread)

    items = get_notifications(session, user.id)

    assert {item.title for item in items} == {"Low stock", "Done"}
    assert get_unread_count(session, user.id) == 1

    marked = mark_as_read(session, unread.id, user.id)

    assert marked is not None
    assert marked.is_read is True
    assert get_unread_count(session, user.id) == 0
    assert mark_as_read(session, other_user.id, user.id) is None
