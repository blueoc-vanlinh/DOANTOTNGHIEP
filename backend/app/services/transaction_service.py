from sqlmodel import Session, select
from app.models.transaction import StockTransaction


def get_last_balance(session: Session, product_id: int, warehouse_id: int):
    stmt = (
        select(StockTransaction)
        .where(
            StockTransaction.product_id == product_id,
            StockTransaction.warehouse_id == warehouse_id
        )
        .order_by(StockTransaction.id.desc())
    )
    last_tx = session.exec(stmt).first()

    return last_tx.balance_after if last_tx else 0


def create_transaction(
    session: Session,
    product_id: int,
    warehouse_id: int,
    type: str,
    quantity: int,
    reference_type: str = None,
    reference_id: int = None,
    user_id: int = None
):
    last_balance = get_last_balance(session, product_id, warehouse_id)
    if type == "IMPORT":
        balance_after = last_balance + quantity
    elif type == "EXPORT":
        balance_after = last_balance - quantity
    else:
        balance_after = last_balance  # ADJUST nếu cần
    transaction = StockTransaction(
        product_id=product_id,
        warehouse_id=warehouse_id,
        type=type,
        quantity=quantity,
        balance_after=balance_after,
        reference_type=reference_type,
        reference_id=reference_id,
        created_by=user_id
    )

    session.add(transaction)
    session.commit()
    session.refresh(transaction)

    return transaction