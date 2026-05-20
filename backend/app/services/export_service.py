from sqlmodel import Session
from app.models.exportorder import ExportOrder, ExportOrderItem
from app.services.inventory_service import decrease_stock, get_inventory
from app.services.invoice_service import create_invoice_from_order
from app.services.transaction_service import create_transaction


def create_export_order(session: Session, data: dict, user_id: int):

    if "items" not in data:
        raise Exception("items required")

    try:
        order = ExportOrder(
            customer_name=data["customer_name"],
            total_amount=0,
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
            order_item = ExportOrderItem(
                export_order_id=order.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"]
            )
            session.add(order_item)
            decrease_stock(
                session,
                item["product_id"],
                item["warehouse_id"],
                item["quantity"]
            )
            create_transaction(
                session=session,
                product_id=item["product_id"],
                warehouse_id=item["warehouse_id"],
                type="EXPORT",
                quantity=item["quantity"],
                reference_type="EXPORT_ORDER",
                reference_id=order.id,
                user_id=user_id
            )

            total_amount += item["quantity"] * item["price"]

        order.total_amount = total_amount

        session.commit()
        session.refresh(order)
        invoice = create_invoice_from_order(
            session=session,
            invoice_type="EXPORT",
            order_id=order.id,
            user_id=user_id,
        )

        return {
            "order": order,
            "invoice": invoice,
        }

    except Exception as e:
        session.rollback()
        raise e
