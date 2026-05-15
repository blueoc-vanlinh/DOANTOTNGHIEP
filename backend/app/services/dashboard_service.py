from datetime import datetime, timedelta

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.product import Product
from app.models.inventory import Inventory
from app.models.transaction import StockTransaction
from app.models.importorder import ImportOrder
from app.models.exportorder import ExportOrder
from app.models.warehouse import Warehouse


def get_dashboard_summary(
    session: Session,
):
    now = datetime.utcnow()

    seven_days_ago = now - timedelta(days=7)

    thirty_days_ago = now - timedelta(days=30)

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

    import_today = session.exec(
        select(func.count(ImportOrder.id)).where(
            ImportOrder.created_at >=
            datetime.utcnow().date()
        )
    ).one()

    export_today = session.exec(
        select(func.count(ExportOrder.id)).where(
            ExportOrder.created_at >=
            datetime.utcnow().date()
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
            StockTransaction.type
            == "EXPORT"
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
            StockTransaction.type
            == "IMPORT"
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

    for i in range(7):

        day = (
            seven_days_ago +
            timedelta(days=i)
        ).date()

        import_count = session.exec(
            select(
                func.count(
                    StockTransaction.id
                )
            ).where(
                StockTransaction.type
                == "IMPORT",

                func.date(
                    StockTransaction.created_at
                )
                == day,
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

                func.date(
                    StockTransaction.created_at
                )
                == day,
            )
        ).one()

        chart_data.append({
            "date":
                str(day),

            "import":
                import_count,

            "export":
                export_count,
        })

    monthly_import_value = session.exec(
        select(
            func.sum(
                ImportOrder.total_amount
            )
        ).where(
            ImportOrder.created_at
            >= thirty_days_ago
        )
    ).one()

    monthly_export_value = session.exec(
        select(
            func.sum(
                ExportOrder.total_amount
            )
        ).where(
            ExportOrder.created_at
            >= thirty_days_ago
        )
    ).one()

    monthly_import_value = (
        monthly_import_value or 0
    )

    monthly_export_value = (
        monthly_export_value or 0
    )

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
                import_today,

            "export_today":
                export_today,

            "total_import_value":
                total_import_value,

            "total_export_value":
                total_export_value,

            "monthly_import_value":
                monthly_import_value,

            "monthly_export_value":
                monthly_export_value,

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
    }