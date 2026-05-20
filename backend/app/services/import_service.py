from sqlmodel import Session
from app.models.importorder import ImportOrder, ImportOrderItem
from app.services.code_service import generate_import_order_code
from app.services.inventory_service import increase_stock
from app.services.transaction_service import create_transaction


def create_import_order(session: Session, data: dict, user_id: int):

    if "items" not in data or not data["items"]:
        raise Exception("items is required")

    try:
        vat_rate = float(data.get("vat_rate", 0.08))
        order = ImportOrder(
            order_code=generate_import_order_code(session),
            supplier_id=data["supplier_id"],
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

            if "product_id" not in item:
                raise Exception("product_id is required")

            if "quantity" not in item or item["quantity"] <= 0:
                raise Exception("quantity must be > 0")

            if "unit_cost" not in item or item["unit_cost"] <= 0:
                raise Exception("unit_cost must be > 0")

            order_item = ImportOrderItem(
                import_order_id=order.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                unit_cost=item["unit_cost"]
            )
            session.add(order_item)

            increase_stock(
                session,
                item["product_id"],
                item["warehouse_id"],
                item["quantity"]
            )

            create_transaction(
                session=session,
                product_id=item["product_id"],
                warehouse_id=item["warehouse_id"],
                type="IMPORT",
                quantity=item["quantity"],
                reference_type="IMPORT_ORDER",
                reference_id=order.id,
                user_id=user_id
            )

            total_amount += item["quantity"] * item["unit_cost"]

        order.total_amount = total_amount
        order.tax_amount = round(total_amount * vat_rate, 2)
        order.grand_total = round(total_amount + order.tax_amount, 2)

        session.commit()
        session.refresh(order)

        return order

    except Exception as e:
        session.rollback()
        raise e
