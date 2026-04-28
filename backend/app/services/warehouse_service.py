from sqlmodel import Session, select
from sqlalchemy import or_, func
from fastapi import HTTPException
from app.models.warehouse import Warehouse

def get_warehouses(
    session: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    query = select(Warehouse)

    # 🔍 SEARCH
    if search:
        query = query.where(
            or_(
                Warehouse.name.ilike(f"%{search}%"),
                Warehouse.address.ilike(f"%{search}%"),
            )
        )

    # 🔽 SORT
    column = getattr(Warehouse, sort_by, Warehouse.created_at)
    query = query.order_by(column.desc() if sort_order == "desc" else column.asc())

    count_query = select(func.count()).select_from(Warehouse)

    if search:
        count_query = count_query.where(
            or_(
                Warehouse.name.ilike(f"%{search}%"),
                Warehouse.address.ilike(f"%{search}%"),
            )
        )

    total = session.exec(count_query).one()

    offset = (page - 1) * page_size
    data = session.exec(query.offset(offset).limit(page_size)).all()

    return {
        "items": data,
        "meta": {
            "total": total,
            "page": page,
            "page_size": page_size,
        },
    }

def get_warehouse(session: Session, warehouse_id: int):
    obj = session.get(Warehouse, warehouse_id)

    if not obj:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    return obj


def create_warehouse(session: Session, data: dict):
    existing = session.exec(
        select(Warehouse).where(Warehouse.name == data["name"])
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Warehouse already exists")

    obj = Warehouse(**data)
    session.add(obj)
    session.commit()
    session.refresh(obj)

    return obj


def update_warehouse(session: Session, warehouse_id: int, data: dict):
    obj = session.get(Warehouse, warehouse_id)

    if not obj:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    if data.get("name"):
        existing = session.exec(
            select(Warehouse).where(
                Warehouse.name == data["name"],
                Warehouse.id != warehouse_id,
            )
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Warehouse already exists")

    for k, v in data.items():
        if v is not None:
            setattr(obj, k, v)

    session.commit()
    session.refresh(obj)

    return obj


def delete_warehouse(session: Session, warehouse_id: int):
    obj = session.get(Warehouse, warehouse_id)

    if not obj:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    session.delete(obj)
    session.commit()

    return {"message": "Deleted successfully"}