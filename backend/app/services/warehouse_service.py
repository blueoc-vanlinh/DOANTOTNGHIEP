from sqlmodel import Session, select
from app.models.warehouse import Warehouse


def get_warehouses(session: Session):
    return session.exec(select(Warehouse)).all()


def get_warehouse(session: Session, warehouse_id: int):
    return session.get(Warehouse, warehouse_id)


def create_warehouse(session: Session, data: dict):
    obj = Warehouse(**data)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def update_warehouse(session: Session, warehouse_id: int, data: dict):
    obj = session.get(Warehouse, warehouse_id)
    if not obj:
        return None

    for k, v in data.items():
        setattr(obj, k, v)

    session.commit()
    session.refresh(obj)
    return obj


def delete_warehouse(session: Session, warehouse_id: int):
    obj = session.get(Warehouse, warehouse_id)
    if not obj:
        return False

    session.delete(obj)
    session.commit()
    return True