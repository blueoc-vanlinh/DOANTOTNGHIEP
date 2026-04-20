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
        Category(name="Điện tử", description="Thiết bị điện tử, máy tính"),
        Category(name="Văn phòng phẩm", description="Dụng cụ và vật dụng văn phòng"),
        Category(name="Thực phẩm & Đồ uống", description="Thực phẩm tươi sống, đồ uống"),
        Category(name="Đồ gia dụng", description="Dụng cụ gia đình, thiết bị nhà bếp"),
        Category(name="Thời trang & Quần áo", description="Quần áo, giày dép, phụ kiện thời trang"),
        Category(name="Sức khỏe & Mỹ phẩm", description="Sản phẩm chăm sóc sức khỏe, mỹ phẩm"),
        Category(name="Thiết bị công nghiệp", description="Máy móc, thiết bị công nghiệp"),
        Category(name="Phụ kiện & Linh kiện", description="Phụ kiện, linh kiện điện tử và cơ khí"),
        Category(name="Đồ chơi & Trò chơi", description="Đồ chơi trẻ em, trò chơi giáo dục"),
        Category(name="Thiết bị thể thao", description="Thiết bị và dụng cụ thể thao"),
        Category(name="Sách & Tài liệu", description="Sách, báo, tài liệu in ấn"),
        Category(name="Nước & Năng lượng", description="Nước tinh khiết, năng lượng tái tạo"),
        Category(name="Nông sản", description="Sản phẩm nông nghiệp, rau quả"),
        Category(name="Dụng cụ làm vườn", description="Công cụ và dụng cụ làm vườn"),
        Category(name="Đồ nội thất", description="Bàn, ghế, tủ, và đồ nội thất khác"),
        Category(name="Đèn & Thắp sáng", description="Đèn LED, chiếu sáng, thiết bị thắp sáng"),
        Category(name="Thiết bị an ninh", description="Camera, khóa, hệ thống báo động"),
        Category(name="Öl & Hóa chất", description="Dầu, hóa chất công nghiệp, hóa chất làm sạch"),
        Category(name="Động vật nuôi", description="Thức ăn, phụ tùng và dụng cụ nuôi động vật"),
        Category(name="Ô tô & Xe máy", description="Phụ tùng, công cụ, phụ kiện ô tô và xe máy"),
    ]

    warehouses = [
        Warehouse(name="Kho Chính - Hà Nội", location="Số 123, đường Lê Lợi, Hoàn Kiếm, Hà Nội"),
        Warehouse(name="Kho TP.HCM", location="Số 456, đường Nguyễn Huệ, Quận 1, TP.HCM"),
        Warehouse(name="Kho Đà Nẵng", location="Số 789, đường Trần Hưng Đạo, Hải Châu, Đà Nẵng"),
        Warehouse(name="Kho Hải Phòng", location="Số 321, đường Diệp Bộ, Hồng Bàng, Hải Phòng"),
        Warehouse(name="Kho Cần Thơ", location="Số 654, đường Hòa Bình, Ninh Kiều, Cần Thơ"),
        Warehouse(name="Kho Lạng Sơn", location="Số 987, đường Phan Bội Châu, Đông Kinh, Lạng Sơn"),
        Warehouse(name="Kho Bắc Giang", location="Số 147, đường Trần Hưng Đạo, Bắc Giang"),
        Warehouse(name="Kho Quảng Ninh", location="Số 258, đường Trần Phú, Hạ Long, Quảng Ninh"),
        Warehouse(name="Kho Hưng Yên", location="Số 369, đường Phố Huế, Phố Nối, Hưng Yên"),
        Warehouse(name="Kho Hải Dương", location="Số 741, đường Ngô Quyền, Hải Dương"),
        Warehouse(name="Kho Tây Ninh", location="Số 111, đường Thống Nhất, Tây Ninh"),
        Warehouse(name="Kho Bình Dương", location="Số 222, đường Trần Hưng Đạo, Bình Dương"),
        Warehouse(name="Kho Đồng Nai", location="Số 333, đường Cách Mạng Tháng 8, Đồng Nai"),
        Warehouse(name="Kho Bà Rịa Vũng Tàu", location="Số 444, đường Trần Phú, Bà Rịa Vũng Tàu"),
        Warehouse(name="Kho Cần Thơ 2", location="Số 555, đường Lê Lợi, Cần Thơ"),
        Warehouse(name="Kho Sóc Trăng", location="Số 666, đường Trần Hưng Đạo, Sóc Trăng"),
        Warehouse(name="Kho Bạc Liêu", location="Số 777, đường Nguyễn Trãi, Bạc Liêu"),
        Warehouse(name="Kho Cà Mau", location="Số 888, đường Phan Bội Châu, Cà Mau"),
        Warehouse(name="Kho Nam Định", location="Số 999, đường Trần Hưng Đạo, Nam Định"),
        Warehouse(name="Kho Thanh Hóa", location="Số 1010, đường Lê Lợi, Thanh Hóa"),
    ]

    suppliers = [
        Supplier(name="Công ty TNHH Thiên Phú", phone="0243 123 4567", email="thienphu@supplier.com", address="Số 10, Phố Trúc Bạch, Ba Đình, Hà Nội"),
        Supplier(name="Công ty CP Việt Nhật", phone="0283 456 7890", email="vietnhat@supplier.com", address="Số 25, Đường Điện Biên Phủ, Quận 5, TP.HCM"),
        Supplier(name="Công ty TNHH Kim Ngân", phone="02363 789 0123", email="kimgan@supplier.com", address="Số 42, Đường Hùng Vương, Hải Châu, Đà Nẵng"),
        Supplier(name="Công ty CP Thái Dương", phone="0225 901 2345", email="thaiduong@supplier.com", address="Số 88, Đường Tràng Tiền, Hồng Bàng, Hải Phòng"),
        Supplier(name="Công ty TNHH Sao Vàng", phone="0292 234 5678", email="saovang@supplier.com", address="Số 156, Đường Trần Hưng Đạo, Ninh Kiều, Cần Thơ"),
        Supplier(name="Công ty CP Dương Hạnh", phone="0205 567 8901", email="duonghanh@supplier.com", address="Số 67, Tỉnh Lộ 5, Lạng Sơn"),
        Supplier(name="Công ty TNHH Huỳnh Phát", phone="0240 678 9012", email="huyenhat@supplier.com", address="Số 200, Đường Lê Hồng Phong, Bắc Giang"),
        Supplier(name="Công ty CP Tương Lai", phone="02033 789 0123", email="tuongla@supplier.com", address="Số 33, Đường Lê Ninh, Hạ Long, Quảng Ninh"),
        Supplier(name="Công ty TNHH Minh Số", phone="0247 890 1234", email="minhso@supplier.com", address="Số 77, Đường Lê Duẩn, Phố Nối, Hưng Yên"),
        Supplier(name="Công ty CP Bình Minh", phone="0220 901 2345", email="binhminh@supplier.com", address="Số 99, Đường Trần Phú, Hải Dương"),
        Supplier(name="Công ty TNHH Trung Hùng", phone="0269 012 3456", email="trunghung@supplier.com", address="Số 121, đường Quốc Lộ 1, Tây Ninh"),
        Supplier(name="Công ty CP Ngôi Sao", phone="0274 234 5678", email="ngoista@supplier.com", address="Số 234, đường Lê Hồng Phong, Bình Dương"),
        Supplier(name="Công ty TNHH Anh Tuấn", phone="0251 345 6789", email="anhuan@supplier.com", address="Số 567, đường Ngô Quyền, Đồng Nai"),
        Supplier(name="Công ty CP Hùng Phát", phone="0264 456 7890", email="hungphat@supplier.com", address="Số 789, đường Trần Phú, Bà Rịa Vũng Tàu"),
        Supplier(name="Công ty TNHH Tân Phước", phone="0292 567 8901", email="tanphuoc@supplier.com", address="Số 101, đường Lê Lợi, Cần Thơ"),
        Supplier(name="Công ty CP Long Hải", phone="0299 678 9012", email="longhai@supplier.com", address="Số 212, đường Trần Hưng Đạo, Sóc Trăng"),
        Supplier(name="Công ty TNHH Bảo Lâm", phone="0267 789 0123", email="baolam@supplier.com", address="Số 323, đường Nguyễn Trãi, Bạc Liêu"),
        Supplier(name="Công ty CP Hải Đông", phone="0294 890 1234", email="haidonn@supplier.com", address="Số 434, đường Phan Bội Châu, Cà Mau"),
        Supplier(name="Công ty TNHH Nam Kinh", phone="0230 901 2345", email="namkinh@supplier.com", address="Số 545, đường Trần Hưng Đạo, Nam Định"),
        Supplier(name="Công ty CP Hoàng Anh", phone="0237 012 3456", email="hoanganh@supplier.com", address="Số 656, đường Lê Lợi, Thanh Hóa"),
    ]

    session.add_all(categories + warehouses + suppliers)
    session.commit()
    return categories, warehouses, suppliers


def seed_users(session: Session, roles: list[Role]):
    default_password = "$2b$12$feXi/X65jKEnHOB0vX2U8.ZgN2r1Zlj2mWUTwLqYE3kI6O9vbbZTW"
    
    users = [
        User(
            name="Nguyễn Văn Linh",
            email="admin@inventory.com",
            password=default_password,
            role_id=roles[0].id,  # Admin
        ),
        User(
            name="Trần Thu Hà",
            email="manager@inventory.com",
            password=default_password,
            role_id=roles[1].id,  # Manager
        ),
        User(
            name="Phạm Minh Đức",
            email="staff1@inventory.com",
            password=default_password,
            role_id=roles[2].id,  # Staff
        ),
        User(
            name="Lê Tấn Phát",
            email="auditor@inventory.com",
            password=default_password,
            role_id=roles[3].id,  # Auditor
        ),
        User(
            name="Hoàng Như Quỳnh",
            email="buyer@inventory.com",
            password=default_password,
            role_id=roles[4].id,  # Buyer
        ),
        User(
            name="Vũ Thị Bình",
            email="seller@inventory.com",
            password=default_password,
            role_id=roles[5].id,  # Seller
        ),
        User(
            name="Đặng Công Minh",
            email="logistic@inventory.com",
            password=default_password,
            role_id=roles[6].id,  # Logistic
        ),
        User(
            name="Bùi Hoàng Yến",
            email="quality@inventory.com",
            password=default_password,
            role_id=roles[7].id,  # Quality
        ),
        User(
            name="Ngô Văn Tuấn",
            email="support@inventory.com",
            password=default_password,
            role_id=roles[8].id,  # Support
        ),
        User(
            name="Đinh Quang Huy",
            email="finance@inventory.com",
            password=default_password,
            role_id=roles[9].id,  # Finance
        ),
    ]

    session.add_all(users)
    session.commit()
    return users


def seed_products(session: Session, categories: list[Category]):
    products = [
        Product(name="Laptop HP Pavilion 15", sku="LT001", barcode="8934501039485", price=15999999.00, category_id=categories[0].id, brand="HP", unit="chiếc", weight=2.1, dimensions={"width": 357, "height": 235, "depth": 18}, status="ACTIVE"),
        Product(name="Bàn phím cơ RGB Fantech", sku="KB001", barcode="8934584939402", price=599999.00, category_id=categories[0].id, brand="Fantech", unit="chiếc", weight=0.8, dimensions={"width": 450, "height": 150, "depth": 30}, status="ACTIVE"),
        Product(name="Chuột không dây Logitech MX Master", sku="MS001", barcode="8934959303945", price=1299999.00, category_id=categories[0].id, brand="Logitech", unit="chiếc", weight=0.24, dimensions={"width": 125, "height": 80, "depth": 50}, status="ACTIVE"),
        Product(name="Ấm điện Philips 1.7L", sku="AP001", barcode="8934501294850", price=149999.00, category_id=categories[3].id, brand="Philips", unit="chiếc", weight=1.2, dimensions={"width": 220, "height": 260, "depth": 150}, status="ACTIVE"),
        Product(name="Bộ tô cơm sứ 6 cái", sku="DW001", barcode="8934584920384", price=249999.00, category_id=categories[3].id, brand="Luminarc", unit="bộ", weight=2.0, dimensions={"width": 180, "height": 180, "depth": 100}, status="ACTIVE"),
        Product(name="Áo sơ mi nam Oxford", sku="CL001", barcode="8934502384950", price=349999.00, category_id=categories[4].id, brand="Việt Tiến", unit="chiếc", weight=0.25, dimensions={"width": 60, "height": 70, "depth": 10}, status="ACTIVE"),
        Product(name="Kem dưỡng ẩm Nivea", sku="BC001", barcode="8934950293845", price=89999.00, category_id=categories[5].id, brand="Nivea", unit="hộp", weight=0.3, dimensions={"width": 80, "height": 60, "depth": 60}, status="ACTIVE"),
        Product(name="Máy khoan pin 20V DeWalt", sku="TL001", barcode="8934029384950", price=2999999.00, category_id=categories[6].id, brand="DeWalt", unit="chiếc", weight=3.5, dimensions={"width": 190, "height": 210, "depth": 100}, status="ACTIVE"),
        Product(name="IC Chip ARMv8 STM32", sku="IC001", barcode="8934589394950", price=299999.00, category_id=categories[7].id, brand="STMicroelectronics", unit="cái", weight=0.05, dimensions={"width": 40, "height": 40, "depth": 5}, status="ACTIVE"),
        Product(name="Đồ chơi xếp hình LEGO Creator", sku="TOY001", barcode="8934029384029", price=799999.00, category_id=categories[8].id, brand="LEGO", unit="bộ", weight=1.5, dimensions={"width": 350, "height": 260, "depth": 150}, status="ACTIVE"),
        Product(name="Giày chạy bộ Nike Running", sku="SH001", barcode="8934501049384", price=2499999.00, category_id=categories[9].id, brand="Nike", unit="đôi", weight=0.5, dimensions={"width": 120, "height": 80, "depth": 140}, status="ACTIVE"),
        Product(name="Sách Lập trình Python", sku="BK001", barcode="8934584039485", price=299000.00, category_id=categories[10].id, brand="Nhà xuất bản Đại học", unit="quyển", weight=0.8, dimensions={"width": 210, "height": 297, "depth": 20}, status="ACTIVE"),
        Product(name="Nước khoáng Vimajax 1.5L", sku="WR001", barcode="8934950384950", price=15000.00, category_id=categories[11].id, brand="Vimajax", unit="chai", weight=1.6, dimensions={"width": 80, "height": 80, "depth": 220}, status="ACTIVE"),
        Product(name="Cà chua Việt Nam 1kg", sku="VG001", barcode="8934501384950", price=45000.00, category_id=categories[12].id, brand="Trang trại Quê Hương", unit="kg", weight=1.0, dimensions={"width": 250, "height": 250, "depth": 200}, status="ACTIVE"),
        Product(name="Bộ dụng cụ làm vườn 5 cái", sku="GN001", barcode="8934584949384", price=299999.00, category_id=categories[13].id, brand="Garden Pro", unit="bộ", weight=2.5, dimensions={"width": 320, "height": 200, "depth": 100}, status="ACTIVE"),
        Product(name="Bàn gỗ tự nhiên 120x80", sku="FR001", barcode="8934950294950", price=3999999.00, category_id=categories[14].id, brand="Woodcraft", unit="chiếc", weight=60.0, dimensions={"width": 1200, "height": 800, "depth": 750}, status="ACTIVE"),
        Product(name="Đèn LED thông minh WiFi", sku="LM001", barcode="8934501949384", price=599999.00, category_id=categories[15].id, brand="Philips Hue", unit="chiếc", weight=0.4, dimensions={"width": 100, "height": 100, "depth": 120}, status="ACTIVE"),
        Product(name="Camera Hikvision 2MP", sku="CM001", barcode="8934584849385", price=1299999.00, category_id=categories[16].id, brand="Hikvision", unit="chiếc", weight=0.3, dimensions={"width": 60, "height": 55, "depth": 180}, status="ACTIVE"),
        Product(name="Dầu nhớt Castrol Edge 5L", sku="OL001", barcode="8934950384851", price=599999.00, category_id=categories[17].id, brand="Castrol", unit="can", weight=5.2, dimensions={"width": 150, "height": 150, "depth": 250}, status="ACTIVE"),
        Product(name="Thức ăn chó Pedigree 20kg", sku="PT001", barcode="8934501384851", price=449999.00, category_id=categories[18].id, brand="Pedigree", unit="túi", weight=20.0, dimensions={"width": 300, "height": 200, "depth": 100}, status="ACTIVE"),
        Product(name="Lốp xe Michelin 185/65R15", sku="TR001", barcode="8934584939485", price=2199999.00, category_id=categories[19].id, brand="Michelin", unit="chiếc", weight=8.5, dimensions={"width": 600, "height": 600, "depth": 200}, status="ACTIVE"),
        Product(name="Màn hình Dell 27 inch IPS", sku="MN001", barcode="8934950294851", price=5999999.00, category_id=categories[0].id, brand="Dell", unit="chiếc", weight=4.5, dimensions={"width": 620, "height": 560, "depth": 200}, status="ACTIVE"),
        Product(name="Tai nghe Sony WH1000XM4", sku="HD001", barcode="8934501949385", price=7999999.00, category_id=categories[0].id, brand="Sony", unit="chiếc", weight=0.25, dimensions={"width": 200, "height": 200, "depth": 80}, status="ACTIVE"),
        Product(name="Bộ quần áo Adidas 3 cái", sku="CL002", barcode="8934584949385", price=1299999.00, category_id=categories[4].id, brand="Adidas", unit="bộ", weight=0.75, dimensions={"width": 300, "height": 200, "depth": 50}, status="ACTIVE"),
        Product(name="Mặt nạ dưỡng da SK-II", sku="BC002", barcode="8934950384952", price=999999.00, category_id=categories[5].id, brand="SK-II", unit="hộp", weight=0.4, dimensions={"width": 120, "height": 120, "depth": 80}, status="ACTIVE"),
        Product(name="Máy hút bụi Dyson V15", sku="AP002", barcode="8934501384952", price=19999999.00, category_id=categories[3].id, brand="Dyson", unit="chiếc", weight=2.3, dimensions={"width": 250, "height": 1200, "depth": 160}, status="ACTIVE"),
        Product(name="Bàn làm việc gỗ veneer", sku="FR002", barcode="8934584949386", price=2999999.00, category_id=categories[14].id, brand="Nội thất An Phú", unit="chiếc", weight=35.0, dimensions={"width": 1400, "height": 700, "depth": 750}, status="ACTIVE"),
        Product(name="Router WiFi 6 ASUS", sku="NW001", barcode="8934950294952", price=1999999.00, category_id=categories[0].id, brand="ASUS", unit="chiếc", weight=0.8, dimensions={"width": 240, "height": 150, "depth": 120}, status="ACTIVE"),
        Product(name="Túi du lịch Samsonite", sku="BG001", barcode="8934501949386", price=4999999.00, category_id=categories[4].id, brand="Samsonite", unit="chiếc", weight=3.5, dimensions={"width": 500, "height": 300, "depth": 250}, status="ACTIVE"),
        Product(name="Kính bảo vệ Blue Light", sku="GP001", barcode="8934584849386", price=799999.00, category_id=categories[5].id, brand="Cyxus", unit="chiếc", weight=0.03, dimensions={"width": 140, "height": 50, "depth": 130}, status="ACTIVE"),
    ]

    session.add_all(products)
    session.commit()
    return products


def seed_inventory(session: Session, products: list[Product], warehouses: list[Warehouse]):
    inventory_rows = [
        Inventory(product_id=products[i % len(products)].id, warehouse_id=warehouses[i % len(warehouses)].id, quantity=50 + i * 10, reserved_quantity=5 + i, oncoming_quantity=10 + i, min_threshold=15)
        for i in range(1, 31)
    ]

    session.add_all(inventory_rows)
    session.commit()
    return inventory_rows


def seed_import_export_orders(session: Session, suppliers: list[Supplier], users: list[User], products: list[Product]):
    import_orders = [
        ImportOrder(
            supplier_id=suppliers[i % len(suppliers)].id,
            total_amount=round(20000000 + i * 2000000, 2),
            status="COMPLETED" if i % 2 == 0 else "PENDING",
            created_by=users[4].id,
        )
        for i in range(1, 21)
    ]

    export_orders = [
        ExportOrder(
            customer_name=f"Khách hàng {i}",
            total_amount=round(15000000 + i * 1500000, 2),
            status="COMPLETED" if i % 2 == 0 else "PENDING",
            created_by=users[5].id,
        )
        for i in range(1, 21)
    ]

    session.add_all(import_orders + export_orders)
    session.commit()

    import_order_items = [
        ImportOrderItem(
            import_order_id=import_orders[i % len(import_orders)].id,
            product_id=products[i % len(products)].id,
            quantity=5 + i * 2,
            unit_cost=100000 + i * 50000,
        )
        for i in range(1, 31)
    ]

    export_order_items = [
        ExportOrderItem(
            export_order_id=export_orders[i % len(export_orders)].id,
            product_id=products[i % len(products)].id,
            quantity=3 + i,
            price=150000 + i * 60000,
        )
        for i in range(1, 31)
    ]

    session.add_all(import_order_items + export_order_items)
    session.commit()
    return import_orders, export_orders, import_order_items, export_order_items


def seed_stock_transactions(session: Session, products: list[Product], warehouses: list[Warehouse], users: list[User]):
    transaction_types = ["IMPORT", "EXPORT", "ADJUST"]
    transactions = [
        StockTransaction(
            product_id=products[i % len(products)].id,
            warehouse_id=warehouses[i % len(warehouses)].id,
            type=transaction_types[i % len(transaction_types)],
            quantity=10 + i * 2,
            balance_after=100 + i * 5,
            reference_type="IMPORT_ORDER" if i % 2 == 0 else "EXPORT_ORDER",
            reference_id=i,
            created_by=users[4].id if i % 2 == 0 else users[5].id,
            note=f"Giao dịch hàng tồn kho {i}",
        )
        for i in range(1, 31)
    ]

    session.add_all(transactions)
    session.commit()
    return transactions


def seed_forecast_results(session: Session, products: list[Product], warehouses: list[Warehouse]):
    today = date.today()
    forecasts = [
        ForecastResult(
            product_id=products[i % len(products)].id,
            warehouse_id=warehouses[i % len(warehouses)].id,
            forecast_date=today + timedelta(days=20 + i),
            predicted_demand=10 + i * 2,
            predicted_stock=100 - i,
            days_to_out_of_stock=50 + i,
            model_used="ARIMA" if i % 2 == 0 else "LSTM",
        )
        for i in range(1, 31)
    ]

    session.add_all(forecasts)
    session.commit()
    return forecasts


def seed_daily_inventory_stats(session: Session, products: list[Product], warehouses: list[Warehouse]):
    today = date.today()
    stats = [
        DailyInventoryStats(
            product_id=products[i % len(products)].id,
            warehouse_id=warehouses[i % len(warehouses)].id,
            date=today - timedelta(days=i),
            opening_stock=100 + i * 5,
            closing_stock=110 + i * 5,
            total_import=20 + i,
            total_export=10 + i,
            inventory_value=round((110 + i * 5) * (10000 + i * 100000), 2),
        )
        for i in range(1, 31)
    ]

    session.add_all(stats)
    session.commit()
    return stats


def seed_notifications(session: Session, users: list[User]):
    notifications = [
        Notification(
            user_id=users[i % len(users)].id,
            title=f"Thông báo số {i}",
            message=f"Nội dung thông báo quan trọng #{i}",
            is_read=(i % 2 == 0),
        )
        for i in range(1, 21)
    ]

    session.add_all(notifications)
    session.commit()
    return notifications


def seed_audit_logs(session: Session, users: list[User]):
    audit_logs = [
        AuditLog(
            user_id=users[i % len(users)].id,
            action="CREATE" if i % 3 == 0 else "UPDATE",
            table_name="products" if i % 2 == 0 else "users",
            record_id=i,
            old_data={"field": f"old_value_{i}"} if i % 2 == 1 else None,
            new_data={"field": f"new_value_{i}"},
        )
        for i in range(1, 26)
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

    print("✓ Seed data đã được chèn thành công!")
    print("  - 10 Danh mục sản phẩm")
    print("  - 20 Kho lưu trữ")
    print("  - 20 Nhà cung cấp")
    print("  - 10 Người dùng")
    print("  - 30 Sản phẩm")
    print("  - 30 Tồn kho")
    print("  - 20 Đơn nhập hàng + 30 Chi tiết đơn nhập")
    print("  - 20 Đơn xuất hàng + 30 Chi tiết đơn xuất")
    print("  - 30 Giao dịch hàng tồn kho")
    print("  - 30 Kết quả dự báo")
    print("  - 30 Thống kê hàng tồn kho hàng ngày")
    print("  - 20 Thông báo")
    print("  - 25 Nhật ký kiểm toán")


if __name__ == "__main__":
    main()
