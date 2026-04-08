from datetime import date, timedelta

from sqlmodel import Session, SQLModel

from app.db.session import engine
from app.models.auth import Permission, Role, RolePermission
from app.models.auditlog import AuditLog
from app.models.product import Category
from app.models.exportorder import ExportOrder, ExportOrderItem
from app.models.forecast import ForecastResult
from app.models.importorder import ImportOrder, ImportOrderItem
from app.models.inventory import Inventory
from app.models.notification import Notification
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.transaction import StockTransaction
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.analytic import DailyInventoryStats


def seed_roles_permissions(session: Session):
    roles = [
        Role(name=name)
        for name in [
            "Admin",
            "Manager",
            "Staff",
            "Auditor",
            "Buyer",
            "Seller",
            "Logistic",
            "Quality",
            "Support",
            "Finance",
        ]
    ]

    permissions = [
        Permission(name=name)
        for name in [
            "view_dashboard",
            "manage_users",
            "manage_products",
            "manage_inventory",
            "create_orders",
            "view_reports",
            "approve_imports",
            "approve_exports",
            "manage_suppliers",
            "view_audit_log",
        ]
    ]

    session.add_all(roles + permissions)
    session.commit()

    role_permissions = [
        RolePermission(role_id=roles[i].id, permission_id=permissions[i].id)
        for i in range(10)
    ]

    session.add_all(role_permissions)
    session.commit()

    return roles, permissions


def seed_categories_warehouses_suppliers(session: Session):
    categories = [
        Category(name=name, description=f"Danh mục {name}")
        for name in [
            "Điện tử",
            "Văn phòng phẩm",
            "Thực phẩm",
            "Đồ gia dụng",
            "Thời trang",
            "Sức khỏe",
            "Thiết bị",
            "Phụ kiện",
            "Đồ chơi",
            "Khuyến mãi",
        ]
    ]

    warehouses = [
        Warehouse(name=f"Kho chính {i+1}", location=f"Tầng {i+1}, Tòa nhà A")
        for i in range(10)
    ]

    suppliers = [
        Supplier(
            name=f"Nhà cung cấp {i+1}",
            phone=f"012345678{i}",
            email=f"supplier{i+1}@example.com",
            address=f"Địa chỉ nhà cung cấp {i+1}",
        )
        for i in range(10)
    ]

    session.add_all(categories + warehouses + suppliers)
    session.commit()
    return categories, warehouses, suppliers


def seed_users(session: Session, roles: list[Role]):
    users = [
        User(
            name=f"Người dùng {i+1}",
            email=f"user{i+1}@example.com",
            password=f"password{i+1}",
            role_id=roles[i % len(roles)].id,
        )
        for i in range(10)
    ]

    session.add_all(users)
    session.commit()
    return users


def seed_products(session: Session, categories: list[Category]):
    products = [
        Product(
            name=f"Sản phẩm {i+1}",
            sku=f"SP{i+1:03d}",
            barcode=f"89000000000{i+1}",
            price=round(10000 + i * 1500.5, 2),
            category_id=categories[i % len(categories)].id,
            brand=f"Thương hiệu {i+1}",
            unit="cái",
            weight=round(0.5 + 0.2 * i, 2),
            dimensions={"width": 10 + i, "height": 5 + i, "depth": 2 + i},
            status="ACTIVE",
        )
        for i in range(10)
    ]

    session.add_all(products)
    session.commit()
    return products


def seed_inventory(session: Session, products: list[Product], warehouses: list[Warehouse]):
    inventory_rows = [
        Inventory(
            product_id=products[i].id,
            warehouse_id=warehouses[i].id,
            quantity=50 + i * 5,
            reserved_quantity=5 + i,
            oncoming_quantity=10 + i,
            min_threshold=10,
        )
        for i in range(10)
    ]

    session.add_all(inventory_rows)
    session.commit()
    return inventory_rows


def seed_import_export_orders(session: Session, suppliers: list[Supplier], users: list[User], products: list[Product]):
    import_orders = [
        ImportOrder(
            supplier_id=suppliers[i].id,
            total_amount=round(100000 + i * 50000, 2),
            status="COMPLETED" if i % 3 != 0 else "PENDING",
            created_by=users[i].id,
        )
        for i in range(10)
    ]

    export_orders = [
        ExportOrder(
            customer_name=f"Khách hàng {i+1}",
            total_amount=round(150000 + i * 40000, 2),
            status="COMPLETED" if i % 2 == 0 else "PENDING",
            created_by=users[(i + 1) % len(users)].id,
        )
        for i in range(10)
    ]

    session.add_all(import_orders + export_orders)
    session.commit()

    import_order_items = [
        ImportOrderItem(
            import_order_id=import_orders[i].id,
            product_id=products[i].id,
            quantity=10 + i * 2,
            unit_cost=round(9500 + i * 700, 2),
        )
        for i in range(10)
    ]

    export_order_items = [
        ExportOrderItem(
            export_order_id=export_orders[i].id,
            product_id=products[(i + 2) % len(products)].id,
            quantity=5 + i,
            price=round(12000 + i * 900, 2),
        )
        for i in range(10)
    ]

    session.add_all(import_order_items + export_order_items)
    session.commit()
    return import_orders, export_orders, import_order_items, export_order_items


def seed_stock_transactions(session: Session, products: list[Product], warehouses: list[Warehouse], users: list[User]):
    transaction_types = ["IMPORT", "EXPORT", "ADJUST"]
    transactions = [
        StockTransaction(
            product_id=products[i].id,
            warehouse_id=warehouses[(i + 1) % len(warehouses)].id,
            type=transaction_types[i % len(transaction_types)],
            quantity=10 + i * 3,
            balance_after=100 + i * 5,
            reference_type="IMPORT_ORDER" if i % 2 == 0 else "EXPORT_ORDER",
            reference_id=i + 1,
            created_by=users[i % len(users)].id,
            note=f"Giao dịch mẫu {i+1}",
        )
        for i in range(10)
    ]

    session.add_all(transactions)
    session.commit()
    return transactions


def seed_forecast_results(session: Session, products: list[Product], warehouses: list[Warehouse]):
    today = date.today()
    forecasts = [
        ForecastResult(
            product_id=products[i].id,
            warehouse_id=warehouses[(i + 2) % len(warehouses)].id,
            forecast_date=today + timedelta(days=i),
            predicted_demand=20 + i * 2,
            predicted_stock=80 - i * 3,
            days_to_out_of_stock=15 - i,
            model_used="ARIMA" if i % 2 == 0 else "LSTM",
        )
        for i in range(10)
    ]

    session.add_all(forecasts)
    session.commit()
    return forecasts


def seed_daily_inventory_stats(session: Session, products: list[Product], warehouses: list[Warehouse]):
    today = date.today()
    stats = [
        DailyInventoryStats(
            product_id=products[i].id,
            warehouse_id=warehouses[(i + 3) % len(warehouses)].id,
            date=today - timedelta(days=i),
            opening_stock=100 + i * 10,
            closing_stock=90 + i * 8,
            total_import=15 + i,
            total_export=10 + i,
            inventory_value=round((90 + i * 8) * 12000.0, 2),
        )
        for i in range(10)
    ]

    session.add_all(stats)
    session.commit()
    return stats


def seed_notifications(session: Session, users: list[User]):
    notifications = [
        Notification(
            user_id=users[i].id,
            title=f"Thông báo {i+1}",
            message=f"Nội dung thông báo số {i+1}.",
            is_read=(i % 2 == 0),
        )
        for i in range(10)
    ]

    session.add_all(notifications)
    session.commit()
    return notifications


def seed_audit_logs(session: Session, users: list[User]):
    audit_logs = [
        AuditLog(
            user_id=users[i].id,
            action="CREATE" if i % 2 == 0 else "UPDATE",
            table_name="products" if i % 2 == 0 else "users",
            record_id=i + 1,
            old_data={"field": "value_old"} if i % 2 == 1 else None,
            new_data={"field": "value_new"} if i % 2 == 0 else None,
        )
        for i in range(10)
    ]

    session.add_all(audit_logs)
    session.commit()
    return audit_logs


def main():
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        roles, permissions = seed_roles_permissions(session)
        categories, warehouses, suppliers = seed_categories_warehouses_suppliers(session)
        users = seed_users(session, roles)
        products = seed_products(session, categories)
        seed_inventory(session, products, warehouses)
        seed_import_export_orders(session, suppliers, users, products)
        seed_stock_transactions(session, products, warehouses, users)
        seed_forecast_results(session, products, warehouses)
        seed_daily_inventory_stats(session, products, warehouses)
        seed_notifications(session, users)
        seed_audit_logs(session, users)

    print("Seed data đã được chèn cho mỗi bảng với 10 bản ghi.")


if __name__ == "__main__":
    main()
