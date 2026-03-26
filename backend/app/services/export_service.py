from sqlmodel import Session
from app.models.exportorder import ExportOrder, ExportOrderItem
from app.services.inventory_service import decrease_stock
from app.services.transaction_service import create_transaction


def create_export_order(session: Session, data: dict, user_id: int):
    order = ExportOrder(
        customer_name=data["customer_name"],
        total_amount=0,
        status="COMPLETED",
        created_by=user_id
    )

    session.add(order)
    session.commit()
    session.refresh(order)

    total_amount = 0

    for item in data["items"]:
        order_item = ExportOrderItem(
            export_order_id=order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["price"]
        )
        session.add(order_item)
        inventory = decrease_stock(
            session,
            item["product_id"],
            data["warehouse_id"],
            item["quantity"]
        )

        create_transaction(
            session=session,
            product_id=item["product_id"],
            warehouse_id=data["warehouse_id"],
            type="EXPORT",
            quantity=item["quantity"],
            reference_type="EXPORT_ORDER",
            reference_id=order.id,
            user_id=user_id
        )

        total_amount += item["quantity"] * item["price"]

    order.total_amount = total_amount
    session.commit()

    return order