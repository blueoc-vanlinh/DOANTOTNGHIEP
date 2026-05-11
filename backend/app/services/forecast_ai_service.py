import pandas as pd

from prophet import Prophet

from fastapi import HTTPException

from sqlmodel import Session, select

from app.models.product import Product
from app.models.transaction import StockTransaction


def ai_forecast_product(
    session: Session,
    product_id: int,
):
    product = session.get(
        Product,
        product_id,
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )
    transactions = session.exec(
        select(StockTransaction)
        .where(
            StockTransaction.product_id == product_id,
            StockTransaction.type == "EXPORT",
        )
        .order_by(
            StockTransaction.created_at.asc()
        )
    ).all()
    if not transactions:
        return {
            "product_id": product.id,
            "product_name": product.name,
            "data": [],
        }
    rows = []

    for t in transactions:

        rows.append({
            "ds": t.created_at.date(),
            "y": t.quantity,
        })

    df = pd.DataFrame(rows)
    df = (
        df.groupby("ds")
        .sum()
        .reset_index()
    )
    model = Prophet(
        daily_seasonality=True,
    )

    model.fit(df)
    future = model.make_future_dataframe(
        periods=30
    )

    forecast = model.predict(future)
    result = []

    for _, row in forecast.tail(30).iterrows():

        result.append({
            "date": row["ds"].strftime("%Y-%m-%d"),

            "predicted": round(
                max(row["yhat"], 0),
                2,
            ),

            "trend": round(
                row["trend"],
                2,
            ),

            "lower_bound": round(
                max(row["yhat_lower"], 0),
                2,
            ),

            "upper_bound": round(
                max(row["yhat_upper"], 0),
                2,
            ),
        })
    total_forecast = sum(
        r["predicted"]
        for r in result
    )

    recommended_import = round(
        total_forecast * 1.2,
        2,
    )
    return {
        "product_id": product.id,

        "product_name": product.name,

        "forecast_days": 30,

        "recommended_import": recommended_import,

        "data": result,
    }