from sqlmodel import Session, select
from sqlalchemy import desc, func
from fastapi import HTTPException
from typing import Optional
from datetime import datetime

from app.models.transaction import StockTransaction
from app.models.product import Product
from app.models.warehouse import Warehouse


# =========================
# 🔍 GET LAST BALANCE
# =========================
def get_last_balance(session: Session, product_id: int, warehouse_id: int):
    stmt = (
        select(StockTransaction.balance_after)
        .where(
            StockTransaction.product_id == product_id,
            StockTransaction.warehouse_id == warehouse_id,
        )
        .order_by(desc(StockTransaction.id))
        .limit(1)
    )

    last_balance = session.exec(stmt).first()
    return last_balance or 0


# =========================
# ➕ CREATE TRANSACTION
# =========================
def create_transaction(
    session: Session,
    product_id: int,
    warehouse_id: int,
    type: str,
    quantity: int,
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
    user_id: Optional[int] = None,
):

    if type not in ["IMPORT", "EXPORT", "ADJUST"]:
        raise HTTPException(400, "Invalid transaction type")

    if quantity <= 0:
        raise HTTPException(400, "Quantity must be greater than 0")

    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")

    warehouse = session.get(Warehouse, warehouse_id)
    if not warehouse:
        raise HTTPException(404, "Warehouse not found")

    last_balance = get_last_balance(session, product_id, warehouse_id)

    if type == "IMPORT":
        balance_after = last_balance + quantity

    elif type == "EXPORT":
        if quantity > last_balance:
            raise HTTPException(400, "Not enough stock")
        balance_after = last_balance - quantity

    else:  
        balance_after = quantity

    transaction = StockTransaction(
        product_id=product_id,
        warehouse_id=warehouse_id,
        type=type,
        quantity=quantity,
        balance_after=balance_after,
        reference_type=reference_type,
        reference_id=reference_id,
        created_by=user_id,
    )

    session.add(transaction)
    session.commit()
    session.refresh(transaction)

    return transaction

def get_transactions(
    session: Session,
    page: int = 1,
    page_size: int = 10,
    product_id: Optional[int] = None,
    warehouse_id: Optional[int] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
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
        query = query.where(Product.name.ilike(f"%{search}%"))

    if start_date:
        query = query.where(StockTransaction.created_at >= start_date)

    if end_date:
        query = query.where(StockTransaction.created_at <= end_date)

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
        count_query = count_query.where(Product.name.ilike(f"%{search}%"))

    if start_date:
        count_query = count_query.where(StockTransaction.created_at >= start_date)

    if end_date:
        count_query = count_query.where(StockTransaction.created_at <= end_date)

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


def get_transaction(session: Session, transaction_id: int):
    stmt = (
        select(
            StockTransaction,
            Product.name.label("product_name"),
            Warehouse.name.label("warehouse_name"),
        )
        .join(Product, Product.id == StockTransaction.product_id)
        .join(Warehouse, Warehouse.id == StockTransaction.warehouse_id)
        .where(StockTransaction.id == transaction_id)
    )

    result = session.exec(stmt).first()

    if not result:
        raise HTTPException(404, "Transaction not found")

    tx, product_name, warehouse_name = result

    return {
        "id": tx.id,
        "product_id": tx.product_id,
        "product_name": product_name,
        "warehouse_id": tx.warehouse_id,
        "warehouse_name": warehouse_name,
        "type": tx.type,
        "quantity": tx.quantity,
        "balance_after": tx.balance_after,
        "created_at": tx.created_at,
    }