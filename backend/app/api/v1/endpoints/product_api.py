from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from app.db.session import get_session
from app.services.product_service import get_products, get_product, create_product, update_product, delete_product
from app.schemas.product_schema import ProductCreate

router = APIRouter()


@router.get("/")
def get_all(
    session: Session = Depends(get_session),
    search: str | None = Query(None),
    category_id: int | None = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    skip = (page - 1) * pageSize
    return get_products(
        session=session,
        search=search,
        category_id=category_id,
        skip=skip,
        limit=pageSize,
    )


@router.get("/{product_id}")
def get_one(product_id: int, session: Session = Depends(get_session)):
    product = get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/")
def create(data: ProductCreate, session: Session = Depends(get_session)):
    return create_product(session, data.model_dump())


@router.put("/{product_id}")
def update(product_id: int, data: ProductCreate, session: Session = Depends(get_session)):
    product = update_product(session, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}")
def delete(product_id: int, session: Session = Depends(get_session)):
    success = delete_product(session, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product has been soft deleted"}