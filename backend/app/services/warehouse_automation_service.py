from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlmodel import Session, func, select

from app.models.inventory import Inventory
from app.models.product import Product
from app.models.transaction import StockTransaction
from app.models.warehouse import Warehouse


def get_auto_po_recommendations(
    session: Session,
    lead_time_days: int = 7,
    coverage_days: int = 30,
):
    rows = session.exec(
        select(Inventory, Product, Warehouse)
        .join(Product, Product.id == Inventory.product_id)
        .join(Warehouse, Warehouse.id == Inventory.warehouse_id)
        .where(Inventory.is_deleted.is_(False))
    ).all()

    recommendations = []
    for inventory, product, warehouse in rows:
        avg_daily_export = _avg_daily_export(
            session,
            product_id=inventory.product_id,
            warehouse_id=inventory.warehouse_id,
        )
        reorder_point = inventory.min_threshold + round(avg_daily_export * lead_time_days)
        target_stock = inventory.min_threshold + round(avg_daily_export * coverage_days)
        available_stock = inventory.quantity - inventory.reserved_quantity + inventory.oncoming_quantity
        recommended_quantity = max(target_stock - available_stock, 0)

        if available_stock <= reorder_point or recommended_quantity > 0:
            recommendations.append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "sku": product.sku,
                    "warehouse_id": warehouse.id,
                    "warehouse_name": warehouse.name,
                    "available_stock": available_stock,
                    "min_threshold": inventory.min_threshold,
                    "avg_daily_export": round(avg_daily_export, 2),
                    "reorder_point": reorder_point,
                    "recommended_quantity": recommended_quantity,
                    "priority": "HIGH" if available_stock <= inventory.min_threshold else "MEDIUM",
                }
            )

    return sorted(recommendations, key=lambda item: (item["priority"] != "HIGH", -item["recommended_quantity"]))


def get_slotting_suggestions(session: Session, days: int = 30):
    since = datetime.utcnow() - timedelta(days=days)
    transactions = session.exec(
        select(StockTransaction)
        .where(
            StockTransaction.type == "EXPORT",
            StockTransaction.created_at >= since,
            StockTransaction.is_deleted.is_(False),
        )
    ).all()

    velocity: dict[int, int] = defaultdict(int)
    for transaction in transactions:
        velocity[transaction.product_id] += transaction.quantity

    ranked = sorted(velocity.items(), key=lambda item: item[1], reverse=True)
    suggestions = []
    total = max(len(ranked), 1)
    for index, (product_id, quantity) in enumerate(ranked):
        product = session.get(Product, product_id)
        percentile = (index + 1) / total
        if percentile <= 0.2:
            zone = "A"
            shelf = "Near packing/export gate"
        elif percentile <= 0.6:
            zone = "B"
            shelf = "Middle picking area"
        else:
            zone = "C"
            shelf = "Reserve/back storage"

        suggestions.append(
            {
                "product_id": product_id,
                "product_name": product.name if product else f"Product #{product_id}",
                "export_quantity": quantity,
                "suggested_zone": zone,
                "suggested_location": shelf,
            }
        )
    return suggestions


def lookup_barcode(session: Session, barcode: str):
    product = session.exec(
        select(Product).where(
            Product.barcode == barcode,
            Product.is_deleted.is_(False),
        )
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Barcode not found")

    inventories = session.exec(
        select(Inventory, Warehouse)
        .join(Warehouse, Warehouse.id == Inventory.warehouse_id)
        .where(
            Inventory.product_id == product.id,
            Inventory.is_deleted.is_(False),
        )
    ).all()
    return {
        "product": product,
        "inventory": [
            {
                "warehouse_id": warehouse.id,
                "warehouse_name": warehouse.name,
                "quantity": inventory.quantity,
                "reserved_quantity": inventory.reserved_quantity,
                "available_quantity": inventory.quantity - inventory.reserved_quantity,
            }
            for inventory, warehouse in inventories
        ],
        "scan_payload": {
            "type": "PRODUCT_SCAN",
            "product_id": product.id,
            "sku": product.sku,
            "barcode": product.barcode,
        },
    }


def _avg_daily_export(session: Session, product_id: int, warehouse_id: int, days: int = 30) -> float:
    since = datetime.utcnow() - timedelta(days=days)
    total = session.exec(
        select(func.coalesce(func.sum(StockTransaction.quantity), 0)).where(
            StockTransaction.product_id == product_id,
            StockTransaction.warehouse_id == warehouse_id,
            StockTransaction.type == "EXPORT",
            StockTransaction.created_at >= since,
            StockTransaction.is_deleted.is_(False),
        )
    ).one()
    return float(total or 0) / days
