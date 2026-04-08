# app/services/dashboard_service.py
from sqlmodel import Session, select, func, and_, case
from datetime import date, timedelta
from typing import List, Dict, Any

from app.models.product import Product
from app.models.inventory import Inventory
from app.models.transaction import StockTransaction


def get_dashboard_summary(session: Session) -> Dict[str, Any]:
    """Lấy thông tin tóm tắt Dashboard"""
    total_products = session.exec(
        select(func.count()).select_from(Product).where(Product.deleted_at == None)
    ).one() or 0

    total_inventory = session.exec(
        select(func.sum(Inventory.quantity))
        .join(Product, Product.id == Inventory.product_id)
        .where(Product.deleted_at == None)
    ).one() or 0

    total_imports = session.exec(
        select(func.sum(StockTransaction.quantity))
        .where(StockTransaction.type == "IMPORT")
    ).one() or 0

    total_exports = session.exec(
        select(func.sum(StockTransaction.quantity))
        .where(StockTransaction.type == "EXPORT")
    ).one() or 0

    low_stock_items = session.exec(
        select(func.count())
        .select_from(Inventory)
        .join(Product, Product.id == Inventory.product_id)
        .where(and_(
            Inventory.quantity <= Inventory.min_threshold,
            Product.deleted_at == None
        ))
    ).one() or 0

    return {
        "total_products": total_products,
        "total_inventory": total_inventory,
        "total_imports": total_imports,
        "total_exports": total_exports,
        "low_stock_items": low_stock_items,
    }


def get_chart_data(session: Session, days: int = 30) -> List[Dict[str, Any]]:
    """Lấy dữ liệu biểu đồ Import vs Export trong N ngày gần nhất"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    # Sửa lỗi func.case() - dùng case() từ sqlalchemy
    stmt = (
        select(
            func.date(StockTransaction.created_at).label("date"),
            func.sum(
                case(
                    (StockTransaction.type == "IMPORT", StockTransaction.quantity),
                    else_=0
                )
            ).label("import_qty"),
            func.sum(
                case(
                    (StockTransaction.type == "EXPORT", StockTransaction.quantity),
                    else_=0
                )
            ).label("export_qty"),
        )
        .where(
            and_(
                func.date(StockTransaction.created_at) >= start_date,
                func.date(StockTransaction.created_at) <= end_date,
            )
        )
        .group_by(func.date(StockTransaction.created_at))
        .order_by(func.date(StockTransaction.created_at))
    )

    result = session.exec(stmt).all()

    chart_data = []
    current = start_date
    while current <= end_date:
        # Tìm dữ liệu của ngày hiện tại
        row = next((r for r in result if r.date == current), None)
        chart_data.append({
            "date": current,
            "import_qty": int(row.import_qty) if row and row.import_qty else 0,
            "export_qty": int(row.export_qty) if row and row.export_qty else 0,
        })
        current += timedelta(days=1)

    return chart_data


def get_top_selling_products(session: Session, limit: int = 5):
    """Top sản phẩm bán chạy"""
    return session.exec(
        select(
            StockTransaction.product_id,
            func.sum(StockTransaction.quantity).label("total_sold")
        )
        .where(StockTransaction.type == "EXPORT")
        .group_by(StockTransaction.product_id)
        .order_by(func.sum(StockTransaction.quantity).desc())
        .limit(limit)
    ).all()


def get_low_stock_products(session: Session, limit: int = 10):
    """Sản phẩm tồn kho thấp"""
    return session.exec(
        select(Product, Inventory)
        .join(Inventory, Product.id == Inventory.product_id)
        .where(and_(
            Inventory.quantity <= Inventory.min_threshold,
            Product.deleted_at == None
        ))
        .order_by(Inventory.quantity.asc())
        .limit(limit)
    ).all()