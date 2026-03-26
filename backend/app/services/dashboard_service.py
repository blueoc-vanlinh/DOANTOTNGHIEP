from sqlmodel import Session, select, func
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.transaction import StockTransaction

def total_inventory(session: Session):
    result = session.exec(
        select(func.sum(Inventory.quantity))
    ).one()
    return result or 0


def low_stock_products(session: Session):
    return session.exec(
        select(Product, Inventory)
        .join(Inventory, Product.id == Inventory.product_id)
        .where(Inventory.quantity <= Inventory.min_threshold)
    ).all()


def top_selling_products(session: Session):
    return session.exec(
        select(
            StockTransaction.product_id,
            func.sum(StockTransaction.quantity).label("total_sold")
        )
        .where(StockTransaction.type == "EXPORT")
        .group_by(StockTransaction.product_id)
        .order_by(func.sum(StockTransaction.quantity).desc())
        .limit(5)
    ).all()


def import_export_summary(session: Session):
    total_import = session.exec(
        select(func.sum(StockTransaction.quantity))
        .where(StockTransaction.type == "IMPORT")
    ).one() or 0

    total_export = session.exec(
        select(func.sum(StockTransaction.quantity))
        .where(StockTransaction.type == "EXPORT")
    ).one() or 0

    return {
        "total_import": total_import,
        "total_export": total_export
    }


def inventory_value(session: Session):
    result = session.exec(
        select(func.sum(Product.price * Inventory.quantity))
        .join(Inventory, Product.id == Inventory.product_id)
    ).one()

    return result or 0