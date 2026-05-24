from datetime import datetime, timedelta

from sqlmodel import select

from app.models.product import Category, Product
from app.models.forecast import ForecastResult
from app.models.transaction import StockTransaction
from app.models.warehouse import Warehouse
from app.services.forecast_ai_service import ai_forecast_product
from app.services.forecast_training_service import train_forecast_for_product


def test_forecast_uses_real_history_and_ai_model(session):
    category = Category(name="AI")
    warehouse = Warehouse(name="Kho AI")
    session.add(category)
    session.add(warehouse)
    session.commit()
    session.refresh(category)
    session.refresh(warehouse)
    product = Product(name="Sản phẩm AI", sku="AI001", price=1000, category_id=category.id)
    session.add(product)
    session.commit()
    session.refresh(product)

    start = datetime.utcnow() - timedelta(days=190)
    for day in range(181):
        session.add(
            StockTransaction(
                product_id=product.id,
                warehouse_id=warehouse.id,
                type="EXPORT",
                quantity=10 + day % 7,
                balance_after=1000 - day,
                created_at=start + timedelta(days=day),
            )
        )
    session.commit()

    result = ai_forecast_product(session, product.id)

    assert result["history"]
    assert result["data"]
    assert result["model_used"] in {"LSTM", "Neural Time Series"}


def test_training_persists_forecast_results(session):
    category = Category(name="AI Persist")
    warehouse = Warehouse(name="Kho Persist")
    session.add(category)
    session.add(warehouse)
    session.commit()
    session.refresh(category)
    session.refresh(warehouse)
    product = Product(name="Sản phẩm Persist", sku="AI002", price=1000, category_id=category.id)
    session.add(product)
    session.commit()
    session.refresh(product)

    start = datetime.utcnow() - timedelta(days=45)
    for day in range(40):
        session.add(
            StockTransaction(
                product_id=product.id,
                warehouse_id=warehouse.id,
                type="EXPORT",
                quantity=5 + day % 3,
                balance_after=500 - day,
                created_at=start + timedelta(days=day),
            )
        )
    session.commit()

    summary = train_forecast_for_product(session, product.id, horizon_days=14)
    rows = session.exec(
        select(ForecastResult).where(ForecastResult.product_id == product.id)
    ).all()

    assert summary["status"] == "trained"
    assert summary["rows_upserted"] == 14
    assert len(rows) == 14
