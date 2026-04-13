from typing import Any, Dict, List, Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, asc, desc, func, or_, select
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductsResponse

def get_products(
    session: Session,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 10,
    sort_by: Optional[str] = None,
    order: str = "asc",
) -> ProductsResponse:

    query = (
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.is_deleted.is_(False))
        .order_by(Product.id.desc())
    )
    if category_id is not None:
        query = query.where(Product.category_id == category_id)

    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
            )
        )
    if sort_by and hasattr(Product, sort_by):
        column = getattr(Product, sort_by)
        query = query.order_by(asc(column) if order.lower() == "asc" else desc(column))
    count_query = select(func.count()).select_from(
        select(Product)
        .where(Product.is_deleted.is_(False))
        .subquery()
    )

    if category_id is not None:
        count_query = count_query.where(Product.category_id == category_id)
    if search:
        count_query = count_query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
            )
        )

    total = session.exec(count_query).one() or 0
    query = query.offset(skip).limit(limit)
    products = session.exec(query).all()
    items: List[Dict[str, Any]] = [
        {
            **p.model_dump(),
            "category": p.category.model_dump() if p.category else None,
        }
        for p in products
    ]

    return ProductsResponse(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
    )


def get_product(session: Session, product_id: int):
    """Lấy một sản phẩm theo ID"""
    return session.exec(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.id == product_id, Product.is_deleted.is_(False))
    ).first()

def create_product(session: Session, data: dict):
    product = Product(**data)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

def update_product(session: Session, product_id: int, data: ProductCreate):
    product = session.exec(
        select(Product).where(
            Product.id == product_id,
            Product.is_deleted.is_(False)
        )
    ).first()

    if not product:
        return None

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(product, key, value)

    try:
        session.commit()
    except:
        session.rollback()
        raise

    session.refresh(product)
    print("UPDATE DATA:", update_data)
    return product


def delete_product(session: Session, product_id: int):
    product = session.get(Product, product_id)

    if not product or product.is_deleted:
        return None

    product.is_deleted = True

    session.commit()
    return True

def count_products(session: Session):
    return session.exec(
        select(func.count())
        .select_from(Product)
        .where(Product.is_deleted.is_(False))
    ).one()