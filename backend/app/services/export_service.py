from sqlmodel import Session
from app.models.exportorder import ExportOrder, ExportOrderItem
from app.models.product import Product
from app.models.transaction import StockTransaction
from app.services.code_service import generate_export_order_code
from app.services.inventory_service import get_inventory
from app.services.invoice_service import create_invoice_from_order


def create_export_order(session: Session, data: dict, user_id: int):

    if "items" not in data:
        raise Exception("items required")

    vat_rate = float(data.get("vat_rate", 0.08))

    try:
        order = ExportOrder(
            order_code=generate_export_order_code(session),
            customer_name=data["customer_name"],
            total_amount=0,
            tax_amount=0,
            grand_total=0,
            status="COMPLETED",
            created_by=user_id
        )

        session.add(order)
        session.flush()  

        total_amount = 0

        for item in data["items"]:

            inventory = get_inventory(
                session,
                item["product_id"],
                item["warehouse_id"]
            )

            if not inventory or inventory.quantity < item["quantity"]:
                raise Exception(f"Not enough stock for product {item['product_id']}")
            product = session.get(Product, item["product_id"])
            if not product:
                raise Exception(f"Product not found {item['product_id']}")
            price = item.get("price") or product.price
            order_item = ExportOrderItem(
                export_order_id=order.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=price
            )
            session.add(order_item)
            inventory.quantity -= item["quantity"]
            session.add(inventory)
            session.add(
                StockTransaction(
                    product_id=item["product_id"],
                    warehouse_id=item["warehouse_id"],
                    type="EXPORT",
                    quantity=item["quantity"],
                    balance_after=inventory.quantity,
                    reference_type="EXPORT_ORDER",
                    reference_id=order.id,
                    created_by=user_id,
                )
            )

            total_amount += item["quantity"] * price

        order.total_amount = total_amount
        order.tax_amount = round(total_amount * vat_rate, 2)
        order.grand_total = round(total_amount + order.tax_amount, 2)

        session.commit()
        session.refresh(order)
        invoice = create_invoice_from_order(
            session=session,
            invoice_type="EXPORT",
            order_id=order.id,
            user_id=user_id,
        )

        return {
            "order": {
                "id": order.id,
                "order_code": order.order_code,
                "customer_name": order.customer_name,
                "total_amount": order.total_amount,
                "tax_amount": order.tax_amount,
                "grand_total": order.grand_total,
                "status": order.status,
            },
            "invoice": invoice,
        }

    except Exception as e:
        session.rollback()
        raise e
