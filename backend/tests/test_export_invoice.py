from app.models.inventory import Inventory
from app.models.product import Category, Product
from app.models.user import User
from app.models.warehouse import Warehouse
from app.services.export_service import create_export_order


def test_export_creates_order_code_invoice_and_uses_product_price(session):
    category = Category(name="Điện tử")
    warehouse = Warehouse(name="Kho chính")
    user = User(name="Seller", email="seller@example.com", password="x", status="ACTIVE")
    session.add(category)
    session.add(warehouse)
    session.add(user)
    session.commit()
    session.refresh(category)
    session.refresh(warehouse)
    session.refresh(user)

    product = Product(
        name="Tai nghe",
        sku="HD001",
        barcode="8930000000001",
        price=250000,
        category_id=category.id,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    session.add(Inventory(product_id=product.id, warehouse_id=warehouse.id, quantity=10))
    session.commit()

    result = create_export_order(
        session,
        {
            "customer_name": "Khách A",
            "vat_rate": 0.08,
            "items": [
                {
                    "product_id": product.id,
                    "warehouse_id": warehouse.id,
                    "quantity": 2,
                }
            ],
        },
        user_id=user.id,
    )

    assert result["order"]["order_code"].startswith("0")
    assert result["order"]["total_amount"] == 500000
    assert result["order"]["tax_amount"] == 40000
    assert result["invoice"]["invoice_number"]
    assert result["invoice"]["grand_total"] == 540000
