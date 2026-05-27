from fastapi import HTTPException
from sqlalchemy import func
from sqlmodel import Session, select

from app.models.exportorder import ExportOrder, ExportOrderItem
from app.models.invoice import Invoice
from app.models.product import Product
from app.models.transaction import StockTransaction
from app.services.code_service import generate_export_order_code
from app.services.inventory_service import get_inventory
from app.services.invoice_service import create_invoice_from_order
from app.services.notification_service import create_notification


ACTIVE_EXPORT_STATUSES = {"PENDING", "APPROVED"}
EXPORT_TYPES = {
    "RETAIL_SALE",
    "WHOLESALE",
    "PRODUCTION_MATERIAL",
    "TRANSFER_OUT",
    "DAMAGED_DISPOSAL",
    "SUPPLIER_RETURN",
    "ADJUSTMENT_OUT",
}


def list_export_orders(
    session: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    status: str | None = None,
    search: str | None = None,
):
    query = select(ExportOrder).where(ExportOrder.is_deleted.is_(False))
    count_query = select(func.count()).select_from(ExportOrder).where(ExportOrder.is_deleted.is_(False))
    if status:
        query = query.where(ExportOrder.status == status)
        count_query = count_query.where(ExportOrder.status == status)
    if search:
        keyword = f"%{search}%"
        query = query.where((ExportOrder.order_code.ilike(keyword)) | (ExportOrder.customer_name.ilike(keyword)))
        count_query = count_query.where((ExportOrder.order_code.ilike(keyword)) | (ExportOrder.customer_name.ilike(keyword)))

    total = session.exec(count_query).one() or 0
    rows = session.exec(
        query.order_by(ExportOrder.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return {
        "items": [order.model_dump() for order in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def get_export_order_detail(session: Session, order_id: int):
    order = _get_export_order(session, order_id)
    rows = session.exec(
        select(ExportOrderItem, Product.name.label("product_name"))
        .join(Product, Product.id == ExportOrderItem.product_id)
        .where(
            ExportOrderItem.export_order_id == order.id,
            ExportOrderItem.is_deleted.is_(False),
        )
    ).all()
    payload = _order_payload(order)["order"]
    payload["items"] = [
        {
            **item.model_dump(),
            "product_name": product_name,
        }
        for item, product_name in rows
    ]
    return payload


def create_export_order(session: Session, data: dict, user_id: int):
    items = _validated_items(data)
    vat_rate = float(data.get("vat_rate", 0.08))
    auto_complete = bool(data.get("auto_complete", True))

    try:
        order = ExportOrder(
            order_code=generate_export_order_code(session),
            export_type=data.get("export_type", "RETAIL_SALE"),
            customer_name=data["customer_name"],
            total_amount=0,
            tax_amount=0,
            grand_total=0,
            status="PENDING",
            created_by=user_id,
        )
        session.add(order)
        session.flush()

        total_amount = 0.0
        for item in items:
            product_id = int(item["product_id"])
            warehouse_id = int(item["warehouse_id"])
            quantity = int(item["quantity"])
            product = session.get(Product, product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product not found {product_id}")

            inventory = get_inventory(session, product_id, warehouse_id)
            available = (inventory.quantity - inventory.reserved_quantity) if inventory else 0
            if available < quantity:
                raise HTTPException(status_code=400, detail=f"Not enough available stock for product {product_id}")

            price = float(item.get("price") or product.price or 0)
            if price < 0:
                raise HTTPException(status_code=400, detail="price cannot be negative")

            session.add(
                ExportOrderItem(
                    export_order_id=order.id,
                    product_id=product_id,
                    warehouse_id=warehouse_id,
                    quantity=quantity,
                    price=price,
                )
            )
            inventory.reserved_quantity += quantity
            session.add(inventory)
            total_amount += quantity * price

        order.total_amount = total_amount
        order.tax_amount = round(total_amount * vat_rate, 2)
        order.grand_total = round(total_amount + order.tax_amount, 2)
        session.commit()
        session.refresh(order)

        if auto_complete:
            return complete_export_order(session, order.id, user_id)

        return _order_payload(order)
    except Exception:
        session.rollback()
        raise


def approve_export_order(session: Session, order_id: int, user_id: int):
    order = _get_export_order(session, order_id)
    if order.status != "PENDING":
        raise HTTPException(status_code=400, detail="Only pending export orders can be approved")
    order.status = "APPROVED"
    session.commit()
    session.refresh(order)
    return _order_payload(order)


def complete_export_order(session: Session, order_id: int, user_id: int):
    order = _get_export_order(session, order_id)
    if order.status == "COMPLETED":
        invoice = create_invoice_from_order(session, "EXPORT", order.id, user_id=user_id)
        return _order_payload(order, invoice=invoice)
    if order.status not in ACTIVE_EXPORT_STATUSES:
        raise HTTPException(status_code=400, detail="Only pending or approved export orders can be completed")

    items = _get_export_items(session, order.id)
    try:
        for item in items:
            if item.warehouse_id is None:
                raise HTTPException(status_code=400, detail="Export item warehouse is required")
            inventory = get_inventory(session, item.product_id, item.warehouse_id)
            if not inventory or inventory.quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for product {item.product_id}")
            inventory.quantity -= item.quantity
            inventory.reserved_quantity = max(inventory.reserved_quantity - item.quantity, 0)
            session.add(inventory)
            session.add(
                StockTransaction(
                    product_id=item.product_id,
                    warehouse_id=item.warehouse_id,
                    type="EXPORT",
                    quantity=item.quantity,
                    balance_after=inventory.quantity,
                    reference_type="EXPORT_ORDER",
                    reference_id=order.id,
                    created_by=user_id,
                )
            )

        order.status = "COMPLETED"
        session.commit()
        session.refresh(order)
        invoice = create_invoice_from_order(session, "EXPORT", order.id, user_id=user_id)
        create_notification(
            session=session,
            user_id=user_id,
            title="Xuất kho hoàn tất",
            message=(
                f"Phiếu xuất {order.order_code} đã trừ tồn kho và tạo hóa đơn "
                f"{invoice['invoice_number']} cho {order.customer_name}."
            ),
        )
        return _order_payload(order, invoice=invoice)
    except Exception:
        session.rollback()
        raise


def cancel_export_order(session: Session, order_id: int, user_id: int):
    order = _get_export_order(session, order_id)
    if order.status == "CANCELLED":
        return _order_payload(order)

    items = _get_export_items(session, order.id)
    try:
        if order.status in ACTIVE_EXPORT_STATUSES:
            for item in items:
                if item.warehouse_id is None:
                    continue
                inventory = get_inventory(session, item.product_id, item.warehouse_id)
                if inventory:
                    inventory.reserved_quantity = max(inventory.reserved_quantity - item.quantity, 0)
                    session.add(inventory)
        elif order.status == "COMPLETED":
            for item in items:
                warehouse_id = _warehouse_for_item(session, item)
                inventory = get_inventory(session, item.product_id, warehouse_id)
                if not inventory:
                    raise HTTPException(status_code=400, detail="Cannot cancel export because inventory row is missing")
                inventory.quantity += item.quantity
                session.add(inventory)
                session.add(
                    StockTransaction(
                        product_id=item.product_id,
                        warehouse_id=warehouse_id,
                        type="EXPORT_CANCEL",
                        quantity=item.quantity,
                        balance_after=inventory.quantity,
                        reference_type="EXPORT_ORDER",
                        reference_id=order.id,
                        created_by=user_id,
                    )
                )
        order.status = "CANCELLED"
        _cancel_invoice(session, "EXPORT", order.id)
        session.commit()
        session.refresh(order)
        return _order_payload(order)
    except Exception:
        session.rollback()
        raise


def _validated_items(data: dict) -> list[dict]:
    if data.get("export_type", "RETAIL_SALE") not in EXPORT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid export_type")
    if not data.get("customer_name"):
        raise HTTPException(status_code=400, detail="customer_name is required")
    items = data.get("items") or []
    if not items:
        raise HTTPException(status_code=400, detail="items required")
    for item in items:
        if not item.get("product_id"):
            raise HTTPException(status_code=400, detail="product_id is required")
        if not item.get("warehouse_id"):
            raise HTTPException(status_code=400, detail="warehouse_id is required")
        if int(item.get("quantity") or 0) <= 0:
            raise HTTPException(status_code=400, detail="quantity must be > 0")
    return items


def _get_export_order(session: Session, order_id: int) -> ExportOrder:
    order = session.get(ExportOrder, order_id)
    if not order or order.is_deleted:
        raise HTTPException(status_code=404, detail="Export order not found")
    return order


def _get_export_items(session: Session, order_id: int) -> list[ExportOrderItem]:
    return session.exec(
        select(ExportOrderItem).where(
            ExportOrderItem.export_order_id == order_id,
            ExportOrderItem.is_deleted.is_(False),
        )
    ).all()


def _warehouse_for_item(session: Session, item: ExportOrderItem) -> int:
    if item.warehouse_id is not None:
        return item.warehouse_id
    transaction = session.exec(
        select(StockTransaction)
        .where(
            StockTransaction.reference_type == "EXPORT_ORDER",
            StockTransaction.reference_id == item.export_order_id,
            StockTransaction.product_id == item.product_id,
        )
        .order_by(StockTransaction.created_at.desc())
    ).first()
    if not transaction:
        raise HTTPException(status_code=400, detail="Cannot determine export warehouse")
    return transaction.warehouse_id


def _order_payload(order: ExportOrder, invoice: dict | None = None) -> dict:
    payload = {
        "order": {
            "id": order.id,
            "order_code": order.order_code,
            "export_type": order.export_type,
            "customer_name": order.customer_name,
            "total_amount": order.total_amount,
            "tax_amount": order.tax_amount,
            "grand_total": order.grand_total,
            "status": order.status,
        }
    }
    if invoice:
        payload["invoice"] = invoice
    return payload


def _cancel_invoice(session: Session, invoice_type: str, order_id: int) -> None:
    invoice = session.exec(
        select(Invoice).where(
            Invoice.invoice_type == invoice_type,
            Invoice.order_id == order_id,
            Invoice.is_deleted.is_(False),
        )
    ).first()
    if invoice:
        invoice.status = "CANCELLED"
        session.add(invoice)
