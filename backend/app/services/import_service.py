from fastapi import HTTPException
from sqlalchemy import func
from sqlmodel import Session, select

from app.models.importorder import ImportOrder, ImportOrderItem
from app.models.inventory import Inventory
from app.models.invoice import Invoice
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.transaction import StockTransaction
from app.models.warehouse import Warehouse
from app.services.code_service import generate_import_order_code
from app.services.inventory_service import get_inventory
from app.services.invoice_service import create_invoice_from_order
from app.services.notification_service import create_notification


ACTIVE_IMPORT_STATUSES = {"PENDING", "APPROVED"}
IMPORT_TYPES = {
    "PURCHASE",
    "RETURN_FROM_CUSTOMER",
    "TRANSFER_IN",
    "PRODUCTION_FINISHED",
    "ADJUSTMENT_IN",
}


def list_import_orders(
    session: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    status: str | None = None,
    search: str | None = None,
):
    query = (
        select(ImportOrder, Supplier.name.label("supplier_name"))
        .join(Supplier, Supplier.id == ImportOrder.supplier_id)
        .where(ImportOrder.is_deleted.is_(False))
    )
    count_query = (
        select(func.count())
        .select_from(ImportOrder)
        .join(Supplier, Supplier.id == ImportOrder.supplier_id)
        .where(ImportOrder.is_deleted.is_(False))
    )
    if status:
        query = query.where(ImportOrder.status == status)
        count_query = count_query.where(ImportOrder.status == status)
    if search:
        keyword = f"%{search}%"
        query = query.where((ImportOrder.order_code.ilike(keyword)) | (Supplier.name.ilike(keyword)))
        count_query = count_query.where((ImportOrder.order_code.ilike(keyword)) | (Supplier.name.ilike(keyword)))

    total = session.exec(count_query).one() or 0
    rows = session.exec(
        query.order_by(ImportOrder.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return {
        "items": [
            {
                **order.model_dump(),
                "supplier_name": supplier_name,
            }
            for order, supplier_name in rows
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def get_import_order_detail(session: Session, order_id: int):
    order = _get_import_order(session, order_id)
    supplier = session.get(Supplier, order.supplier_id)
    rows = session.exec(
        select(ImportOrderItem, Product.name.label("product_name"), Warehouse.name.label("warehouse_name"))
        .join(Product, Product.id == ImportOrderItem.product_id)
        .join(Warehouse, Warehouse.id == ImportOrderItem.warehouse_id)
        .where(ImportOrderItem.import_order_id == order.id)
    ).all()
    payload = _order_payload(order)["order"]
    payload["supplier_name"] = supplier.name if supplier else None
    payload["items"] = [
        {
            **item.model_dump(),
            "product_name": product_name,
            "warehouse_name": warehouse_name,
        }
        for item, product_name, warehouse_name in rows
    ]
    return payload


def create_import_order(session: Session, data: dict, user_id: int):
    items = _validated_items(data)
    vat_rate = float(data.get("vat_rate", 0.08))
    auto_complete = bool(data.get("auto_complete", True))

    try:
        order = ImportOrder(
            order_code=generate_import_order_code(session),
            import_type=data.get("import_type", "PURCHASE"),
            supplier_id=data["supplier_id"],
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
            quantity = int(item["quantity"])
            unit_cost = float(item["unit_cost"])
            session.add(
                ImportOrderItem(
                    import_order_id=order.id,
                    product_id=item["product_id"],
                    warehouse_id=item["warehouse_id"],
                    quantity=quantity,
                    unit_cost=unit_cost,
                )
            )
            _increase_oncoming(session, item["product_id"], item["warehouse_id"], quantity)
            total_amount += quantity * unit_cost

        order.total_amount = total_amount
        order.tax_amount = round(total_amount * vat_rate, 2)
        order.grand_total = round(total_amount + order.tax_amount, 2)

        session.commit()
        session.refresh(order)

        if auto_complete:
            return complete_import_order(session, order.id, user_id)

        return _order_payload(order)
    except Exception:
        session.rollback()
        raise


def approve_import_order(session: Session, order_id: int, user_id: int):
    order = _get_import_order(session, order_id)
    if order.status != "PENDING":
        raise HTTPException(status_code=400, detail="Only pending import orders can be approved")
    order.status = "APPROVED"
    session.commit()
    session.refresh(order)
    return _order_payload(order)


def complete_import_order(session: Session, order_id: int, user_id: int):
    order = _get_import_order(session, order_id)
    if order.status == "COMPLETED":
        invoice = create_invoice_from_order(session, "IMPORT", order.id, user_id=user_id)
        return _order_payload(order, invoice=invoice)
    if order.status not in ACTIVE_IMPORT_STATUSES:
        raise HTTPException(status_code=400, detail="Only pending or approved import orders can be received")

    items = _get_import_items(session, order.id)
    try:
        for item in items:
            if item.warehouse_id is None:
                raise HTTPException(status_code=400, detail="Import item warehouse is required")
            _decrease_oncoming(session, item.product_id, item.warehouse_id, item.quantity)
            inventory = get_inventory(session, item.product_id, item.warehouse_id)
            if not inventory:
                inventory = Inventory(product_id=item.product_id, warehouse_id=item.warehouse_id, quantity=0)
            inventory.quantity += item.quantity
            session.add(inventory)
            session.add(
                StockTransaction(
                    product_id=item.product_id,
                    warehouse_id=item.warehouse_id,
                    type="IMPORT",
                    quantity=item.quantity,
                    balance_after=inventory.quantity,
                    reference_type="IMPORT_ORDER",
                    reference_id=order.id,
                    created_by=user_id,
                )
            )

        order.status = "COMPLETED"
        session.commit()
        session.refresh(order)
        invoice = create_invoice_from_order(session, "IMPORT", order.id, user_id=user_id)
        create_notification(
            session=session,
            user_id=user_id,
            title="Nhập kho hoàn tất",
            message=f"Phiếu nhập {order.order_code} đã cập nhật tồn kho và tạo hóa đơn {invoice['invoice_number']}.",
        )
        return _order_payload(order, invoice=invoice)
    except Exception:
        session.rollback()
        raise


def cancel_import_order(session: Session, order_id: int, user_id: int):
    order = _get_import_order(session, order_id)
    if order.status == "CANCELLED":
        return _order_payload(order)

    items = _get_import_items(session, order.id)
    try:
        if order.status in ACTIVE_IMPORT_STATUSES:
            for item in items:
                if item.warehouse_id is not None:
                    _decrease_oncoming(session, item.product_id, item.warehouse_id, item.quantity)
        elif order.status == "COMPLETED":
            for item in items:
                if item.warehouse_id is None:
                    continue
                inventory = get_inventory(session, item.product_id, item.warehouse_id)
                if not inventory or inventory.quantity < item.quantity:
                    raise HTTPException(status_code=400, detail="Cannot cancel received import because stock was already used")
                inventory.quantity -= item.quantity
                session.add(inventory)
                session.add(
                    StockTransaction(
                        product_id=item.product_id,
                        warehouse_id=item.warehouse_id,
                        type="IMPORT_CANCEL",
                        quantity=item.quantity,
                        balance_after=inventory.quantity,
                        reference_type="IMPORT_ORDER",
                        reference_id=order.id,
                        created_by=user_id,
                    )
                )
        order.status = "CANCELLED"
        _cancel_invoice(session, "IMPORT", order.id)
        session.commit()
        session.refresh(order)
        return _order_payload(order)
    except Exception:
        session.rollback()
        raise


def _validated_items(data: dict) -> list[dict]:
    if data.get("import_type", "PURCHASE") not in IMPORT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid import_type")
    if not data.get("supplier_id"):
        raise HTTPException(status_code=400, detail="supplier_id is required")
    items = data.get("items") or []
    if not items:
        raise HTTPException(status_code=400, detail="items is required")

    for item in items:
        if not item.get("product_id"):
            raise HTTPException(status_code=400, detail="product_id is required")
        if not item.get("warehouse_id"):
            raise HTTPException(status_code=400, detail="warehouse_id is required")
        if int(item.get("quantity") or 0) <= 0:
            raise HTTPException(status_code=400, detail="quantity must be > 0")
        if float(item.get("unit_cost") or 0) <= 0:
            raise HTTPException(status_code=400, detail="unit_cost must be > 0")
    return items


def _get_import_order(session: Session, order_id: int) -> ImportOrder:
    order = session.get(ImportOrder, order_id)
    if not order or order.is_deleted:
        raise HTTPException(status_code=404, detail="Import order not found")
    return order


def _get_import_items(session: Session, order_id: int) -> list[ImportOrderItem]:
    return session.exec(select(ImportOrderItem).where(ImportOrderItem.import_order_id == order_id)).all()


def _increase_oncoming(session: Session, product_id: int, warehouse_id: int, quantity: int) -> None:
    inventory = get_inventory(session, product_id, warehouse_id)
    if not inventory:
        inventory = Inventory(product_id=product_id, warehouse_id=warehouse_id, quantity=0)
    inventory.oncoming_quantity += quantity
    session.add(inventory)


def _decrease_oncoming(session: Session, product_id: int, warehouse_id: int, quantity: int) -> None:
    inventory = get_inventory(session, product_id, warehouse_id)
    if inventory:
        inventory.oncoming_quantity = max(inventory.oncoming_quantity - quantity, 0)
        session.add(inventory)


def _order_payload(order: ImportOrder, invoice: dict | None = None) -> dict:
    payload = {
        "order": {
            "id": order.id,
            "order_code": order.order_code,
            "import_type": order.import_type,
            "supplier_id": order.supplier_id,
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
