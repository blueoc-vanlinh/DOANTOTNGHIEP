from sqlmodel import Session, select
from app.models.product import Product
from app.schemas.product_schema import ProductCreate


def get_products(session: Session):
    return session.exec(select(Product)).all()


def get_product(session: Session, product_id: int):
    return session.get(Product, product_id)


def create_product(session: Session, data: dict):
    product = Product(**data)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def update_product(session: Session, product_id: int, data: ProductCreate):
    product = session.get(Product, product_id)
    if not product:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    session.commit()
    session.refresh(product)
    return product


def delete_product(session: Session, product_id: int):
    product = session.get(Product, product_id)
    if not product:
        return None

    session.delete(product)
    session.commit()
    return True