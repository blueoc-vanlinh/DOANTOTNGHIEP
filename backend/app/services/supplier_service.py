from sqlmodel import Session, select
from app.models.supplier import Supplier


def get_suppliers(session: Session):
    return session.exec(select(Supplier)).all()


def get_supplier(session: Session, supplier_id: int):
    return session.get(Supplier, supplier_id)


def create_supplier(session: Session, data: dict):
    obj = Supplier(**data)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def update_supplier(session: Session, supplier_id: int, data: dict):
    obj = session.get(Supplier, supplier_id)
    if not obj:
        return None

    for k, v in data.items():
        setattr(obj, k, v)

    session.commit()
    session.refresh(obj)
    return obj


def delete_supplier(session: Session, supplier_id: int):
    obj = session.get(Supplier, supplier_id)
    if not obj:
        return False

    session.delete(obj)
    session.commit()
    return True