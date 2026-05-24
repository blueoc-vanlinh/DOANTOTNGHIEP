from datetime import date, datetime, timedelta

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.product import Product
from app.models.inventory import Inventory
from app.models.transaction import StockTransaction
from app.models.importorder import ImportOrder
from app.models.exportorder import ExportOrder
from app.models.warehouse import Warehouse
from app.models.forecast import ForecastResult
from app.services.ai_model_evaluation_service import get_best_model_summary


def get_dashboard_summary(
    session: Session,
    period: str = "day",
    target_date: date | None = None,
    target_month: str | None = None,
    target_year: int | None = None,
):
    now = datetime.utcnow()
    period_start, period_end, chart_points, chart_label = _period_config(
        now,
        period,
        target_date=target_date,
        target_month=target_month,
        target_year=target_year,
    )

    total_products = session.exec(
        select(func.count(Product.id))
    ).one()

    total_warehouses = session.exec(
        select(func.count(Warehouse.id))
    ).one()

    total_inventory = session.exec(
        select(func.sum(Inventory.quantity))
    ).one()

    total_inventory = (
        total_inventory or 0
    )

    total_import_orders = session.exec(
        select(func.count(ImportOrder.id))
    ).one()

    total_export_orders = session.exec(
        select(func.count(ExportOrder.id))
    ).one()

    import_in_period = session.exec(
        select(func.count(ImportOrder.id)).where(
            ImportOrder.created_at >= period_start,
            ImportOrder.created_at < period_end,
        )
    ).one()

    export_in_period = session.exec(
        select(func.count(ExportOrder.id)).where(
            ExportOrder.created_at >= period_start,
            ExportOrder.created_at < period_end,
        )
    ).one()


    total_import_value = session.exec(
        select(
            func.sum(
                ImportOrder.total_amount
            )
        )
    ).one()

    total_import_value = (
        total_import_value or 0
    )

    total_export_value = session.exec(
        select(
            func.sum(
                ExportOrder.total_amount
            )
        )
    ).one()

    total_export_value = (
        total_export_value or 0
    )

    low_stock_query = session.exec(
        select(Inventory)
        .where(
            Inventory.quantity
            <= Inventory.min_threshold
        )
        .order_by(
            Inventory.quantity.asc()
        )
        .limit(10)
    ).all()

    low_stock_products = []

    for inv in low_stock_query:

        product = session.get(
            Product,
            inv.product_id,
        )

        warehouse = session.get(
            Warehouse,
            inv.warehouse_id,
        )

        low_stock_products.append({
            "inventory_id":
                inv.id,

            "product_id":
                inv.product_id,

            "product_name":
                product.name
                if product
                else None,

            "warehouse_id":
                inv.warehouse_id,

            "warehouse_name":
                warehouse.name
                if warehouse
                else None,

            "quantity":
                inv.quantity,

            "min_threshold":
                inv.min_threshold,
        })

    out_of_stock_count = session.exec(
        select(func.count(Inventory.id))
        .where(
            Inventory.quantity <= 0
        )
    ).one()

    recent_transactions_query = (
        session.exec(
            select(StockTransaction)
            .order_by(
                StockTransaction.created_at.desc()
            )
            .limit(10)
        ).all()
    )

    recent_transactions = []

    for t in recent_transactions_query:

        product = session.get(
            Product,
            t.product_id,
        )

        warehouse = session.get(
            Warehouse,
            t.warehouse_id,
        )

        recent_transactions.append({
            "id": t.id,

            "type": t.type,

            "product_id":
                t.product_id,

            "product_name":
                product.name
                if product
                else None,

            "warehouse_id":
                t.warehouse_id,

            "warehouse_name":
                warehouse.name
                if warehouse
                else None,

            "quantity":
                t.quantity,

            "reference_type":
                t.reference_type,

            "reference_id":
                t.reference_id,

            "created_at":
                t.created_at,
        })

    top_export_query = session.exec(
        select(
            StockTransaction.product_id,
            func.sum(
                StockTransaction.quantity
            ).label(
                "total_export"
            ),
        )
        .where(
            StockTransaction.type == "EXPORT",
            StockTransaction.created_at >= period_start,
            StockTransaction.created_at < period_end,
        )
        .group_by(
            StockTransaction.product_id
        )
        .order_by(
            func.sum(
                StockTransaction.quantity
            ).desc()
        )
        .limit(5)
    ).all()

    top_export_products = []

    for product_id, total_export in (
        top_export_query
    ):
        product = session.get(
            Product,
            product_id,
        )

        top_export_products.append({
            "product_id":
                product_id,

            "product_name":
                product.name
                if product
                else None,

            "total_export":
                total_export,
        })

    top_import_query = session.exec(
        select(
            StockTransaction.product_id,
            func.sum(
                StockTransaction.quantity
            ).label(
                "total_import"
            ),
        )
        .where(
            StockTransaction.type == "IMPORT",
            StockTransaction.created_at >= period_start,
            StockTransaction.created_at < period_end,
        )
        .group_by(
            StockTransaction.product_id
        )
        .order_by(
            func.sum(
                StockTransaction.quantity
            ).desc()
        )
        .limit(5)
    ).all()

    top_import_products = []

    for product_id, total_import in (
        top_import_query
    ):
        product = session.get(
            Product,
            product_id,
        )

        top_import_products.append({
            "product_id":
                product_id,

            "product_name":
                product.name
                if product
                else None,

            "total_import":
                total_import,
        })

    chart_data = []

    for point_start, point_end, label in chart_points:

        import_count = session.exec(
            select(
                func.count(
                    StockTransaction.id
                )
            ).where(
                StockTransaction.type
                == "IMPORT",
                StockTransaction.created_at >= point_start,
                StockTransaction.created_at < point_end,
            )
        ).one()

        export_count = session.exec(
            select(
                func.count(
                    StockTransaction.id
                )
            ).where(
                StockTransaction.type
                == "EXPORT",
                StockTransaction.created_at >= point_start,
                StockTransaction.created_at < point_end,
            )
        ).one()

        import_value = session.exec(
            select(func.sum(ImportOrder.total_amount)).where(
                ImportOrder.created_at >= point_start,
                ImportOrder.created_at < point_end,
            )
        ).one() or 0

        export_value = session.exec(
            select(func.sum(ExportOrder.total_amount)).where(
                ExportOrder.created_at >= point_start,
                ExportOrder.created_at < point_end,
            )
        ).one() or 0

        chart_data.append({
            "date": label,
            "import": import_count,
            "export": export_count,
            "import_value": float(import_value),
            "export_value": float(export_value),
        })

    period_import_value = session.exec(
        select(
            func.sum(
                ImportOrder.total_amount
            )
        ).where(
            ImportOrder.created_at
            >= period_start,
            ImportOrder.created_at < period_end,
        )
    ).one()

    period_export_value = session.exec(
        select(
            func.sum(
                ExportOrder.total_amount
            )
        ).where(
            ExportOrder.created_at
            >= period_start,
            ExportOrder.created_at < period_end,
        )
    ).one()

    period_import_value = period_import_value or 0
    period_export_value = period_export_value or 0
    period_profit = period_export_value - period_import_value

    inventory_value = session.exec(
        select(func.sum(Inventory.quantity * Product.price))
        .join(Product, Product.id == Inventory.product_id)
    ).one() or 0
    ai_status = _build_ai_status(session)

    return {
        "summary": {
            "total_products":
                total_products,

            "total_warehouses":
                total_warehouses,

            "total_inventory":
                total_inventory,

            "total_import_orders":
                total_import_orders,

            "total_export_orders":
                total_export_orders,

            "import_today":
                import_in_period,

            "export_today":
                export_in_period,

            "total_import_value":
                total_import_value,

            "total_export_value":
                total_export_value,

            "monthly_import_value":
                period_import_value,

            "monthly_export_value":
                period_export_value,

            "period_import_orders": import_in_period,

            "period_export_orders": export_in_period,

            "period_import_value": period_import_value,

            "period_export_value": period_export_value,

            "period_profit": period_profit,

            "inventory_value": inventory_value,

            "low_stock_count":
                len(
                    low_stock_products
                ),

            "out_of_stock_count":
                out_of_stock_count,
        },

        "low_stock_products":
            low_stock_products,

        "recent_transactions":
            recent_transactions,

        "top_export_products":
            top_export_products,

        "top_import_products":
            top_import_products,

        "transaction_chart":
            chart_data,

        "period": {
            "type": period,
            "start": period_start,
            "end": period_end,
            "chart_label": chart_label,
        },
        "ai_status": ai_status,
    }


def _build_ai_status(session: Session):
    best_model = get_best_model_summary()
    last_train_at = session.exec(
        select(func.max(ForecastResult.updated_at)).where(ForecastResult.is_deleted.is_(False))
    ).one()
    forecast_rows = session.exec(
        select(func.count()).select_from(ForecastResult).where(ForecastResult.is_deleted.is_(False))
    ).one() or 0
    forecast_product_count = session.exec(
        select(func.count(func.distinct(ForecastResult.product_id))).where(ForecastResult.is_deleted.is_(False))
    ).one() or 0
    recommended_import_count = session.exec(
        select(func.count(func.distinct(ForecastResult.product_id))).where(
            ForecastResult.is_deleted.is_(False),
            ForecastResult.predicted_stock <= 0,
        )
    ).one() or 0
    risk_product_count = session.exec(
        select(func.count(func.distinct(Inventory.product_id))).where(
            Inventory.is_deleted.is_(False),
            Inventory.quantity <= Inventory.min_threshold,
        )
    ).one() or 0

    return {
        "best_model": best_model.get("model"),
        "accuracy": best_model.get("accuracy"),
        "dataset_used": best_model.get("dataset"),
        "train_points": best_model.get("train_points"),
        "test_points": best_model.get("test_points"),
        "last_train_at": last_train_at,
        "forecast_rows": forecast_rows,
        "forecast_product_count": forecast_product_count,
        "recommended_import_count": recommended_import_count,
        "risk_product_count": risk_product_count,
    }


def _period_config(
    now: datetime,
    period: str,
    target_date: date | None = None,
    target_month: str | None = None,
    target_year: int | None = None,
):
    if period == "year":
        year = target_year or now.year
        start = datetime(year, 1, 1)
        end = datetime(year + 1, 1, 1)
        points = []
        for month in range(1, 13):
            point_start = datetime(year, month, 1)
            point_end = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)
            points.append((point_start, point_end, f"Tháng {month}"))
        return start, end, points, f"Theo tháng trong năm {year}"

    if period == "month":
        if target_month:
            year, month = [int(part) for part in target_month.split("-", 1)]
        else:
            year, month = now.year, now.month
        start = datetime(year, month, 1)
        end = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)
        points = []
        cursor = start
        while cursor < end:
            next_cursor = cursor + timedelta(days=1)
            points.append((cursor, next_cursor, cursor.strftime("%d/%m")))
            cursor = next_cursor
        return start, end, points, f"Theo ngày trong tháng {month:02d}/{year}"

    selected = target_date or now.date()
    start = datetime(selected.year, selected.month, selected.day)
    end = start + timedelta(days=1)
    points = []
    for hour in range(24):
        point_start = start + timedelta(hours=hour)
        point_end = point_start + timedelta(hours=1)
        points.append((point_start, point_end, f"{hour:02d}:00"))
    return start, end, points, f"Theo giờ ngày {selected.strftime('%d/%m/%Y')}"
