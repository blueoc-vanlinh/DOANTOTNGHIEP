import pandas as pd
import numpy as np

from prophet import Prophet

from fastapi import HTTPException

from sqlmodel import Session, select
from datetime import datetime, timedelta
from collections import defaultdict
from app.models.external_factor import ExternalFactor
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
    df["ds"] = pd.to_datetime(df["ds"])
    factor_map = _external_impact_by_date(session, product_id)
    df["external_impact"] = df["ds"].dt.date.map(
        lambda day: factor_map.get(day, 0.0)
    )
    history = [
        {
            "date": row["ds"].strftime("%Y-%m-%d"),
            "actual": round(float(row["y"]), 2),
            "external_impact": round(float(row["external_impact"]), 2),
        }
        for _, row in df.tail(60).iterrows()
    ]
    if len(df) < 2:
        fake_result = []

        last_quantity = float(
                df["y"].iloc[-1]
        ) if len(df) > 0 else 0.0

        for i in range(1, 15):

            fake_result.append({
                "date": (
                    datetime.now() + timedelta(days=i)
                ).strftime("%Y-%m-%d"),

                "predicted": round(
                    last_quantity,
                    2,
                ),

                "trend": round(
                    last_quantity,
                    2,
                ),

                "lower_bound": round(
                    last_quantity * 0.9,
                    2,
                ),

                "upper_bound": round(
                    last_quantity * 1.1,
                    2,
                ),
            })

        return {
            "product_id": product.id,

            "product_name": product.name,

            "forecast_days": 14,

            "recommended_import": round(
                last_quantity * 10,
                2,
            ),

            "warning": "Not enough historical data for AI training",

            "history": history,

            "data": fake_result,
        }
    if len(df) >= 180:
        result = _neural_time_series_forecast(df, factor_map, periods=30)
        model_used = "Neural Time Series"
    else:
        result = _prophet_forecast(df, factor_map, periods=30)
        model_used = "Prophet"

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

        "model_used": model_used,

        "external_factors_used": bool(
            df["external_impact"].abs().sum() > 0
        ),

        "deep_learning_status": (
            "Đang dùng mô hình học máy thật từ dữ liệu lịch sử. "
            "Khi có từ 180 ngày dữ liệu, hệ thống ưu tiên neural time-series; "
            "khi ít dữ liệu hơn, hệ thống dùng Prophet làm baseline."
        ),

        "history": history,

        "data": result,
    }


def _prophet_forecast(df: pd.DataFrame, factor_map: dict, periods: int = 30):
    model = Prophet(daily_seasonality=True)
    if df["external_impact"].abs().sum() > 0:
        model.add_regressor("external_impact")

    model.fit(df)
    future = model.make_future_dataframe(
        periods=periods
    )
    future["external_impact"] = future["ds"].dt.date.map(
        lambda day: factor_map.get(day, 0.0)
    )

    forecast = model.predict(future)
    result = []

    for _, row in forecast.tail(periods).iterrows():

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
    return result


def _neural_time_series_forecast(df: pd.DataFrame, factor_map: dict, periods: int = 30):
    values = df["y"].astype(float).to_numpy()
    impacts = df["external_impact"].astype(float).to_numpy()
    window = 14

    y_mean = values.mean()
    y_std = values.std() or 1.0
    impact_std = impacts.std() or 1.0
    y_scaled = (values - y_mean) / y_std
    impact_scaled = impacts / impact_std

    x_rows = []
    y_rows = []
    for index in range(window, len(values)):
        lag_values = y_scaled[index - window:index]
        lag_impacts = impact_scaled[index - window:index]
        day = pd.Timestamp(df["ds"].iloc[index])
        day_features = _date_features(day)
        x_rows.append(np.concatenate([lag_values, lag_impacts, day_features]))
        y_rows.append(y_scaled[index])

    x = np.asarray(x_rows, dtype=float)
    y = np.asarray(y_rows, dtype=float).reshape(-1, 1)
    rng = np.random.default_rng(42)
    hidden = 24
    w1 = rng.normal(0, 0.08, size=(x.shape[1], hidden))
    b1 = np.zeros((1, hidden))
    w2 = rng.normal(0, 0.08, size=(hidden, 1))
    b2 = np.zeros((1, 1))
    lr = 0.01

    for _ in range(500):
        h = np.tanh(x @ w1 + b1)
        pred = h @ w2 + b2
        error = pred - y
        grad_pred = 2 * error / len(x)
        grad_w2 = h.T @ grad_pred
        grad_b2 = grad_pred.sum(axis=0, keepdims=True)
        grad_h = grad_pred @ w2.T
        grad_z1 = grad_h * (1 - h ** 2)
        grad_w1 = x.T @ grad_z1
        grad_b1 = grad_z1.sum(axis=0, keepdims=True)
        w1 -= lr * grad_w1
        b1 -= lr * grad_b1
        w2 -= lr * grad_w2
        b2 -= lr * grad_b2

    train_pred = np.tanh(x @ w1 + b1) @ w2 + b2
    residual_std = float(((train_pred - y).flatten() * y_std).std() or y_std * 0.15)

    future_values = list(y_scaled)
    future_impacts = list(impact_scaled)
    result = []
    last_date = pd.Timestamp(df["ds"].iloc[-1])
    for step in range(1, periods + 1):
        next_date = last_date + timedelta(days=step)
        raw_impact = factor_map.get(next_date.date(), 0.0)
        scaled_impact = raw_impact / impact_std
        features = np.concatenate([
            np.asarray(future_values[-window:]),
            np.asarray(future_impacts[-window:]),
            _date_features(next_date),
        ]).reshape(1, -1)
        scaled_prediction = float((np.tanh(features @ w1 + b1) @ w2 + b2)[0, 0])
        prediction = max(scaled_prediction * y_std + y_mean, 0)
        future_values.append(scaled_prediction)
        future_impacts.append(scaled_impact)
        trend = np.mean([
            max(item * y_std + y_mean, 0)
            for item in future_values[-7:]
        ])
        result.append({
            "date": next_date.strftime("%Y-%m-%d"),
            "predicted": round(prediction, 2),
            "trend": round(float(trend), 2),
            "lower_bound": round(max(prediction - residual_std * 1.64, 0), 2),
            "upper_bound": round(prediction + residual_std * 1.64, 2),
        })
    return result


def _date_features(day: pd.Timestamp):
    day_of_week = day.dayofweek
    month = day.month
    return np.asarray([
        np.sin(2 * np.pi * day_of_week / 7),
        np.cos(2 * np.pi * day_of_week / 7),
        np.sin(2 * np.pi * month / 12),
        np.cos(2 * np.pi * month / 12),
    ], dtype=float)


def _external_impact_by_date(session: Session, product_id: int):
    factors = session.exec(
        select(ExternalFactor).where(
            (ExternalFactor.product_id == product_id) | (ExternalFactor.product_id.is_(None)),
            ExternalFactor.is_deleted.is_(False),
        )
    ).all()
    impact_by_date = defaultdict(float)
    for factor in factors:
        impact_by_date[factor.factor_date] += factor.impact_score
    return impact_by_date
