from sqlmodel import Session, select
from sqlalchemy import or_, func
from fastapi import HTTPException
from app.models.supplier import Supplier


def get_suppliers(
    session: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    query = select(Supplier).where(~Supplier.is_deleted)

    if search:
        query = query.where(
            or_(
                Supplier.name.ilike(f"%{search}%"),
                Supplier.email.ilike(f"%{search}%"),
                Supplier.phone.ilike(f"%{search}%"),
            )
        )

    column = getattr(Supplier, sort_by, Supplier.created_at)
    query = query.order_by(column.desc() if sort_order == "desc" else column.asc())

    count_query = select(func.count()).select_from(Supplier).where(~Supplier.is_deleted)
    if search:
        count_query = count_query.where(
            or_(
                Supplier.name.ilike(f"%{search}%"),
                Supplier.email.ilike(f"%{search}%"),
                Supplier.phone.ilike(f"%{search}%"),
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


def get_supplier(session: Session, supplier_id: int):
    obj = session.get(Supplier, supplier_id)
    if not obj or obj.is_deleted:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return obj


def create_supplier(session: Session, data: dict):
    data.pop("is_active", None)
    if data.get("email"):
        existing = session.exec(
            select(Supplier).where(
                Supplier.email == data["email"],
                ~Supplier.is_deleted,
            )
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

    obj = Supplier(**data)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


def update_supplier(session: Session, supplier_id: int, data: dict):
    data.pop("is_active", None)
    obj = session.get(Supplier, supplier_id)

    if not obj or obj.is_deleted:
        raise HTTPException(status_code=404, detail="Supplier not found")

    if data.get("email"):
        existing = session.exec(
            select(Supplier).where(
                Supplier.email == data["email"],
                Supplier.id != supplier_id,
                ~Supplier.is_deleted,
            )
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

    for k, v in data.items():
        if v is not None:
            setattr(obj, k, v)

    session.commit()
    session.refresh(obj)

    return obj

def delete_supplier(session: Session, supplier_id: int):
    obj = session.get(Supplier, supplier_id)

    if not obj or obj.is_deleted:
        raise HTTPException(status_code=404, detail="Supplier not found")

    obj.is_deleted = True
    session.commit()

    return {"message": "Deleted successfully"}
