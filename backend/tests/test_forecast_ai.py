from datetime import datetime, timedelta

from app.models.product import Category, Product
from app.models.transaction import StockTransaction
from app.models.warehouse import Warehouse
from app.services.forecast_ai_service import ai_forecast_product


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
