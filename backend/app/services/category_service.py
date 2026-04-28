from sqlmodel import Session, select
from sqlalchemy import or_, func
from fastapi import HTTPException
from app.models.product import Category

def get_categories(
    session: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    query = select(Category)

    # 🔍 SEARCH
    if search:
        query = query.where(
            or_(
                Category.name.ilike(f"%{search}%"),
                Category.description.ilike(f"%{search}%"),
            )
        )

    column = getattr(Category, sort_by, Category.created_at)
    query = query.order_by(column.desc() if sort_order == "desc" else column.asc())

    total = session.exec(
        select(func.count()).select_from(Category)
    ).one()

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


def get_category(session: Session, category_id: int):
    obj = session.get(Category, category_id)

    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")

    return obj


def create_category(session: Session, data: dict):
    # 🔥 check duplicate name
    existing = session.exec(
        select(Category).where(Category.name == data["name"])
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    obj = Category(**data)
    session.add(obj)
    session.commit()
    session.refresh(obj)

    return obj

def update_category(session: Session, category_id: int, data: dict):
    obj = session.get(Category, category_id)

    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")

    # 🔥 check duplicate name
    if data.get("name"):
        existing = session.exec(
            select(Category).where(
                Category.name == data["name"],
                Category.id != category_id,
            )
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Category already exists")

    for k, v in data.items():
        if v is not None:
            setattr(obj, k, v)

    session.commit()
    session.refresh(obj)

    return obj


def delete_category(session: Session, category_id: int):
    obj = session.get(Category, category_id)

    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")

    session.delete(obj)
    session.commit()

    return {"message": "Deleted successfully"}