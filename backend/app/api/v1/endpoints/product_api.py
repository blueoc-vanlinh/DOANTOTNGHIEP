from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.session import get_session
from app.services.product_service import get_products, get_product, create_product, update_product, delete_product
from app.schemas.product_schema import ProductCreate

router = APIRouter()


@router.get("/")
def get_all(session: Session = Depends(get_session)):
    return get_products(session)


@router.get("/{product_id}")
def get_one(product_id: int, session: Session = Depends(get_session)):
    product = get_product(session, product_id)
    if not product:
        raise HTTPException(404, "Not found")
    return product


@router.post("/")
def create(
    data: ProductCreate,
    session: Session = Depends(get_session)
):
    return create_product(session, data.model_dump())


@router.put("/{product_id}")
def update(product_id: int, data: ProductCreate, session: Session = Depends(get_session)):
    return update_product(session, product_id, data)


# DELETE
@router.delete("/{product_id}")
def delete(product_id: int, session: Session = Depends(get_session)):
    return delete_product(session, product_id)