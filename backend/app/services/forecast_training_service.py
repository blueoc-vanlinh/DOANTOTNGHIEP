from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from sqlmodel import Session, select

from app.models.forecast import ForecastResult
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.transaction import StockTransaction
from app.models.warehouse import Warehouse
from app.services.ai_model_evaluation_service import get_best_model_summary
from app.services.forecast_ai_service import ai_forecast_product


def train_forecast_for_product(
    session: Session,
    product_id: int,
    horizon_days: int = 30,
) -> dict:
    product = session.get(Product, product_id)
    if not product:
        return {
            "product_id": product_id,
            "status": "missing_product",
            "rows_upserted": 0,
        }

    forecast = ai_forecast_product(session, product_id)
    best_model = get_best_model_summary()
    model_used = str(best_model.get("model") or forecast.get("model_used") or "AI Forecast")
    forecast_rows = (forecast.get("data") or [])[:horizon_days]
    if not forecast_rows:
        return {
            "product_id": product.id,
            "product_name": product.name,
            "status": "no_history",
            "rows_upserted": 0,
        }

    warehouse_allocations = _resolve_warehouse_allocations(session, product_id)
    if not warehouse_allocations:
        default_warehouse = session.exec(
            select(Warehouse).where(Warehouse.is_deleted.is_(False)).order_by(Warehouse.id.asc())
        ).first()
        if not default_warehouse:
            return {
                "product_id": product.id,
                "product_name": product.name,
                "status": "missing_warehouse",
                "rows_upserted": 0,
            }
        warehouse_allocations = [{
            "warehouse_id": default_warehouse.id,
            "share": 1.0,
            "available_stock": int(forecast.get("available_quantity", 0) or 0),
        }]

    forecast_dates = [
        date.fromisoformat(row["date"])
        for row in forecast_rows
    ]
    existing_rows = session.exec(
        select(ForecastResult).where(
            ForecastResult.product_id == product_id,
            ForecastResult.forecast_date >= min(forecast_dates),
        )
    ).all()
    active_keys = {
        (item["warehouse_id"], forecast_date)
        for item in warehouse_allocations
        for forecast_date in forecast_dates
    }
    existing_map = {
        (row.warehouse_id, row.forecast_date): row
        for row in existing_rows
    }

    for row in existing_rows:
        if (row.warehouse_id, row.forecast_date) not in active_keys:
            row.is_deleted = True

    rows_upserted = 0
    for allocation in warehouse_allocations:
        warehouse_id = allocation["warehouse_id"]
        available_stock = int(allocation["available_stock"])
        share = float(allocation["share"])
        cumulative_demand = 0
        depletion_day: int | None = None
        per_day_demand: list[int] = []

        for row in forecast_rows:
            demand = max(int(round(float(row.get("predicted", 0)) * share)), 0)
            per_day_demand.append(demand)
            cumulative_demand += demand
            if depletion_day is None and cumulative_demand >= available_stock and available_stock > 0:
                depletion_day = len(per_day_demand)

        if available_stock <= 0:
            depletion_day = 0

        cumulative_demand = 0
        for index, row in enumerate(forecast_rows):
            forecast_date = date.fromisoformat(row["date"])
            predicted_demand = per_day_demand[index]
            cumulative_demand += predicted_demand
            predicted_stock = max(available_stock - cumulative_demand, 0)
            days_to_out_of_stock = (
                depletion_day if depletion_day is not None else max(len(forecast_rows), 999)
            )

            existing = existing_map.get((warehouse_id, forecast_date))
            if existing:
                existing.predicted_demand = predicted_demand
                existing.predicted_stock = predicted_stock
                existing.days_to_out_of_stock = days_to_out_of_stock
                existing.model_used = model_used
                existing.is_deleted = False
                existing.updated_at = datetime.utcnow()
            else:
                session.add(
                    ForecastResult(
                        product_id=product_id,
                        warehouse_id=warehouse_id,
                        forecast_date=forecast_date,
                        predicted_demand=predicted_demand,
                        predicted_stock=predicted_stock,
                        days_to_out_of_stock=days_to_out_of_stock,
                        model_used=model_used,
                    )
                )
            rows_upserted += 1

    session.commit()
    return {
        "product_id": product.id,
        "product_name": product.name,
        "status": "trained",
        "rows_upserted": rows_upserted,
        "forecast_days": len(forecast_rows),
        "warehouses": len(warehouse_allocations),
        "model_used": model_used,
        "model_accuracy": best_model.get("accuracy"),
        "dataset_used": best_model.get("dataset"),
        "train_points": best_model.get("train_points"),
        "test_points": best_model.get("test_points"),
    }


def train_all_product_forecasts(
    session: Session,
    horizon_days: int = 30,
) -> dict:
    products = session.exec(
        select(Product).where(Product.is_deleted.is_(False)).order_by(Product.id.asc())
    ).all()

    summaries = []
    trained_products = 0
    total_rows_upserted = 0
    for product in products:
        summary = train_forecast_for_product(
            session=session,
            product_id=product.id,
            horizon_days=horizon_days,
        )
        summaries.append(summary)
        if summary.get("status") == "trained":
            trained_products += 1
            total_rows_upserted += int(summary.get("rows_upserted", 0))

    return {
        "status": "completed",
        "products_total": len(products),
        "products_trained": trained_products,
        "rows_upserted": total_rows_upserted,
        "details": summaries,
    }


def _resolve_warehouse_allocations(session: Session, product_id: int) -> list[dict]:
    inventory_rows = session.exec(
        select(Inventory).where(
            Inventory.product_id == product_id,
            Inventory.is_deleted.is_(False),
        )
    ).all()
    exports = session.exec(
        select(StockTransaction).where(
            StockTransaction.product_id == product_id,
            StockTransaction.type == "EXPORT",
            StockTransaction.is_deleted.is_(False),
        )
    ).all()

    export_totals: dict[int, int] = defaultdict(int)
    for item in exports:
        export_totals[item.warehouse_id] += int(item.quantity or 0)

    inventory_by_warehouse = {
        row.warehouse_id: max(
            int((row.quantity or 0) - (row.reserved_quantity or 0) + (row.oncoming_quantity or 0)),
            0,
        )
        for row in inventory_rows
    }
    warehouse_ids = sorted(set(inventory_by_warehouse) | set(export_totals))
    if not warehouse_ids:
        return []

    total_export = sum(export_totals.values())
    total_stock = sum(inventory_by_warehouse.values())
    allocations = []
    for warehouse_id in warehouse_ids:
        share = 0.0
        if total_export > 0:
            share = export_totals.get(warehouse_id, 0) / total_export
        elif total_stock > 0:
            share = inventory_by_warehouse.get(warehouse_id, 0) / total_stock
        else:
            share = 1 / len(warehouse_ids)

        allocations.append({
            "warehouse_id": warehouse_id,
            "share": share,
            "available_stock": inventory_by_warehouse.get(warehouse_id, 0),
        })

    share_sum = sum(item["share"] for item in allocations) or 1.0
    for item in allocations:
        item["share"] = item["share"] / share_sum

    return allocations
