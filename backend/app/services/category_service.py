from sqlmodel import Session, select
from app.models.product import Category


def get_categories(session: Session):
    return session.exec(select(Category)).all()


def get_category(session: Session, category_id: int):
    return session.get(Category, category_id)


def create_category(session: Session, data: dict):
    obj = Category(**data)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def update_category(session: Session, category_id: int, data: dict):
    obj = session.get(Category, category_id)
    if not obj:
        return None

    for k, v in data.items():
        setattr(obj, k, v)

    session.commit()
    session.refresh(obj)
    return obj


def delete_category(session: Session, category_id: int):
    obj = session.get(Category, category_id)
    if not obj:
        return None

    session.delete(obj)
    session.commit()
    return True