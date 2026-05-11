from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.product import Product
from app.models.transaction import StockTransaction


def get_forecast_by_product(
    session: Session,
    product_id: int,
):
    product = session.get(Product, product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )
    transactions = session.exec(
        select(StockTransaction)
        .where(
            StockTransaction.product_id == product_id
        )
        .order_by(
            StockTransaction.created_at.desc()
        )
        .limit(30)
    ).all()
    if not transactions:
        return {
            "product_id": product.id,
            "product_name": product.name,
            "data": [],
        }
    export_transactions = [
        t for t in transactions
        if t.type == "EXPORT"
    ]

    total_export = sum(
        t.quantity for t in export_transactions
    )

    avg_daily_export = (
        total_export / max(len(export_transactions), 1)
    )
    latest_transaction = transactions[0]

    current_stock = (
        latest_transaction.balance_after or 0
    )
    forecast_data = []

    today = datetime.now()

    predicted_stock = current_stock

    for i in range(1, 15):

        predicted_stock -= avg_daily_export

        if predicted_stock < 0:
            predicted_stock = 0

        forecast_data.append({
            "date": (
                today + timedelta(days=i)
            ).strftime("%Y-%m-%d"),

            "predicted": round(
                predicted_stock,
                2,
            ),

            "actual": max(
                0,
                round(
                    predicted_stock - (i * 1.5),
                    2,
                ),
            ),
        })
    return {
        "product_id": product.id,

        "product_name": product.name,

        "current_stock": current_stock,

        "average_daily_export": round(
            avg_daily_export,
            2,
        ),

        "recommended_import": round(
            avg_daily_export * 30,
            2,
        ),

        "data": forecast_data,
    }