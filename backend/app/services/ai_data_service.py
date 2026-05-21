from collections import defaultdict

from fastapi import HTTPException
from sqlmodel import Session, func, select

from app.models.external_factor import ExternalFactor
from app.models.forecast import ForecastResult
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.transaction import StockTransaction


MIN_DEEP_LEARNING_DAYS = 180
MIN_PROPHET_DAYS = 30


def get_ai_data_overview(session: Session):
    counts = {
        "products": _count(session, Product),
        "inventory_records": _count(session, Inventory),
        "current_stock_quantity": session.exec(
            select(func.sum(Inventory.quantity)).where(Inventory.is_deleted.is_(False))
        ).one() or 0,
        "stock_transactions": _count(session, StockTransaction),
        "export_transactions": _count(
            session,
            StockTransaction,
            StockTransaction.type == "EXPORT",
        ),
        "forecast_results": _count(session, ForecastResult),
        "external_factors": _count(session, ExternalFactor),
    }

    export_dates = session.exec(
        select(
            func.min(StockTransaction.created_at),
            func.max(StockTransaction.created_at),
        ).where(StockTransaction.type == "EXPORT")
    ).one()

    product_quality = []
    products = session.exec(select(Product).where(Product.is_deleted.is_(False))).all()
    for product in products:
        product_quality.append(get_product_training_quality(session, product.id))

    return {
        "counts": counts,
        "export_history": {
            "first_date": export_dates[0],
            "last_date": export_dates[1],
        },
        "quality_by_product": product_quality,
        "recommendation": _build_recommendation(counts, product_quality),
    }


def get_product_training_quality(session: Session, product_id: int):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    rows = session.exec(
        select(StockTransaction)
        .where(
            StockTransaction.product_id == product_id,
            StockTransaction.type == "EXPORT",
            StockTransaction.is_deleted.is_(False),
        )
        .order_by(StockTransaction.created_at.asc())
    ).all()

    daily_totals: dict[str, int] = defaultdict(int)
    for row in rows:
        daily_totals[row.created_at.date().isoformat()] += row.quantity

    unique_days = len(daily_totals)
    total_quantity = sum(daily_totals.values())
    has_external_factors = session.exec(
        select(func.count())
        .select_from(ExternalFactor)
        .where(
            (ExternalFactor.product_id == product_id) | (ExternalFactor.product_id.is_(None)),
            ExternalFactor.is_deleted.is_(False),
        )
    ).one()
    current_stock_quantity = session.exec(
        select(func.sum(Inventory.quantity)).where(
            Inventory.product_id == product_id,
            Inventory.is_deleted.is_(False),
        )
    ).one() or 0

    if unique_days >= MIN_DEEP_LEARNING_DAYS:
        model_ready = "LSTM_TRANSFORMER_READY"
    elif unique_days >= MIN_PROPHET_DAYS:
        model_ready = "PROPHET_READY"
    else:
        model_ready = "INSUFFICIENT_DATA"
    minimum_accuracy = _estimate_minimum_accuracy(
        unique_days=unique_days,
        transaction_records=len(rows),
        external_factor_records=has_external_factors,
    )

    return {
        "product_id": product.id,
        "product_name": product.name,
        "transaction_records": len(rows),
        "unique_training_days": unique_days,
        "total_export_quantity": total_quantity,
        "current_stock_quantity": current_stock_quantity,
        "minimum_accuracy": minimum_accuracy,
        "external_factor_records": has_external_factors,
        "model_ready": model_ready,
        "missing_for_deep_learning_days": max(MIN_DEEP_LEARNING_DAYS - unique_days, 0),
        "missing_for_prophet_days": max(MIN_PROPHET_DAYS - unique_days, 0),
    }


def create_external_factor(session: Session, data: dict):
    factor = ExternalFactor(**data)
    session.add(factor)
    session.commit()
    session.refresh(factor)
    return factor


def list_external_factors(session: Session, skip: int = 0, limit: int = 100):
    return session.exec(
        select(ExternalFactor)
        .where(ExternalFactor.is_deleted.is_(False))
        .order_by(ExternalFactor.factor_date.desc())
        .offset(skip)
        .limit(limit)
    ).all()


def get_deep_learning_dataset(session: Session, product_id: int):
    quality = get_product_training_quality(session, product_id)
    transactions = session.exec(
        select(StockTransaction)
        .where(
            StockTransaction.product_id == product_id,
            StockTransaction.type == "EXPORT",
            StockTransaction.is_deleted.is_(False),
        )
        .order_by(StockTransaction.created_at.asc())
    ).all()
    daily_totals: dict[str, int] = defaultdict(int)
    for row in transactions:
        daily_totals[row.created_at.date().isoformat()] += row.quantity

    factors = session.exec(
        select(ExternalFactor).where(
            (ExternalFactor.product_id == product_id) | (ExternalFactor.product_id.is_(None)),
            ExternalFactor.is_deleted.is_(False),
        )
    ).all()
    factor_map: dict[str, float] = defaultdict(float)
    for factor in factors:
        factor_map[factor.factor_date.isoformat()] += factor.impact_score

    rows = [
        {
            "date": date,
            "export_quantity": quantity,
            "external_impact": factor_map.get(date, 0),
        }
        for date, quantity in sorted(daily_totals.items())
    ]
    return {
        "quality": quality,
        "target_models": ["Prophet", "LSTM", "Transformer"],
        "features": ["export_quantity", "external_impact"],
        "rows": rows,
    }


def _count(session: Session, model, *conditions) -> int:
    query = select(func.count()).select_from(model)
    for condition in conditions:
        query = query.where(condition)
    return session.exec(query).one() or 0


def _build_recommendation(counts: dict, product_quality: list[dict]):
    ready_for_deep_learning = [
        item for item in product_quality if item["model_ready"] == "LSTM_TRANSFORMER_READY"
    ]
    if ready_for_deep_learning:
        return "Dataset is large enough for deep learning experiments on selected products."
    if counts["export_transactions"] == 0:
        return "No export history is available. Seed or collect real sales/export data before AI training."
    return "Keep Prophet as baseline and collect more daily export history plus external factors before LSTM/Transformer."


def _estimate_minimum_accuracy(
    unique_days: int,
    transaction_records: int,
    external_factor_records: int,
) -> float:
    day_score = min(unique_days / MIN_DEEP_LEARNING_DAYS, 1) * 45
    record_score = min(transaction_records / 500, 1) * 20
    factor_score = min(external_factor_records / 30, 1) * 10
    conservative_accuracy = 35 + day_score + record_score + factor_score
    return round(min(conservative_accuracy, 92), 2)
