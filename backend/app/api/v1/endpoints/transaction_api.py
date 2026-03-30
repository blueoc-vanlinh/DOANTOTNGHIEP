from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.transaction import StockTransaction

router = APIRouter()


@router.get("/")
def get_all_transactions(session: Session = Depends(get_session)):
    return session.exec(select(StockTransaction)).all()


@router.get("/product/{product_id}")
def get_by_product(product_id: int, session: Session = Depends(get_session)):
    return session.exec(
        select(StockTransaction).where(
            StockTransaction.product_id == product_id
        )
    ).all()


@router.get("/warehouse/{warehouse_id}")
def get_by_warehouse(warehouse_id: int, session: Session = Depends(get_session)):
    return session.exec(
        select(StockTransaction).where(
            StockTransaction.warehouse_id == warehouse_id
        )
    ).all()


@router.get("/{transaction_id}")
def get_one(transaction_id: int, session: Session = Depends(get_session)):
    return session.get(StockTransaction, transaction_id)