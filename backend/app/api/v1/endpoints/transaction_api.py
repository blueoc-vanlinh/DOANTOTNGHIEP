from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from sqlalchemy import desc, func
from typing import Optional

from app.db.session import get_session
from app.models.transaction import StockTransaction
from app.models.product import Product
from app.models.warehouse import Warehouse

router = APIRouter(tags=["Stock Transactions"])

@router.get("/")
def list_transactions(
    session: Session = Depends(get_session),
    product_id: Optional[int] = None,
    warehouse_id: Optional[int] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, le=100),
):

    query = (
        select(
            StockTransaction,
            Product.name.label("product_name"),
            Warehouse.name.label("warehouse_name"),
        )
        .join(Product, Product.id == StockTransaction.product_id)
        .join(Warehouse, Warehouse.id == StockTransaction.warehouse_id)
    )

    if product_id:
        query = query.where(StockTransaction.product_id == product_id)

    if warehouse_id:
        query = query.where(StockTransaction.warehouse_id == warehouse_id)

    if type:
        query = query.where(StockTransaction.type == type)

    if search:
        query = query.where(
            Product.name.ilike(f"%{search}%")
        )


    query = query.order_by(desc(StockTransaction.id))

    count_query = (
        select(func.count())
        .select_from(StockTransaction)
        .join(Product, Product.id == StockTransaction.product_id)
        .join(Warehouse, Warehouse.id == StockTransaction.warehouse_id)
    )

    if product_id:
        count_query = count_query.where(StockTransaction.product_id == product_id)

    if warehouse_id:
        count_query = count_query.where(StockTransaction.warehouse_id == warehouse_id)

    if type:
        count_query = count_query.where(StockTransaction.type == type)

    if search:
        count_query = count_query.where(
            Product.name.ilike(f"%{search}%")
        )

    total = session.exec(count_query).one()

    offset = (page - 1) * page_size
    results = session.exec(query.offset(offset).limit(page_size)).all()

    items = []
    for tx, product_name, warehouse_name in results:
        items.append({
            "id": tx.id,
            "product_id": tx.product_id,
            "product_name": product_name,
            "warehouse_id": tx.warehouse_id,
            "warehouse_name": warehouse_name,
            "type": tx.type,
            "quantity": tx.quantity,
            "balance_after": tx.balance_after,
            "reference_type": tx.reference_type,
            "reference_id": tx.reference_id,
            "created_at": tx.created_at,
        })

    return {
        "items": items,
        "meta": {
            "total": total,
            "page": page,
            "page_size": page_size,
        },
    }