from sqlmodel import Session, select
from app.models.user import User


def get_users(session: Session):
    return session.exec(select(User)).all()


def get_user(session: Session, user_id: int):
    return session.get(User, user_id)


def create_user(session: Session, data: dict):
    user = User(**data)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def update_user(session: Session, user_id: int, data: dict):
    user = session.get(User, user_id)
    if not user:
        return None

    for k, v in data.items():
        setattr(user, k, v)

    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user_id: int):
    user = session.get(User, user_id)
    if not user:
        return False

    session.delete(user)
    session.commit()
    return True