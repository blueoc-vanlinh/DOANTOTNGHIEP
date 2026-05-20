from datetime import datetime

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.exportorder import ExportOrder, ExportOrderItem
from app.models.importorder import ImportOrder, ImportOrderItem
from app.models.invoice import Invoice, InvoiceItem
from app.models.product import Product
from app.models.supplier import Supplier
from app.services.code_service import generate_invoice_number


def _invoice_number(session: Session, issued_at: datetime | None = None) -> str:
    return generate_invoice_number(session, issued_at)


def create_invoice(session: Session, data: dict, user_id: int | None = None):
    if not data.get("items"):
        raise HTTPException(status_code=400, detail="Invoice items are required")

    invoice_type = data["invoice_type"]
    order_id = int(data["order_id"])
    existing = session.exec(
        select(Invoice).where(
            Invoice.invoice_type == invoice_type,
            Invoice.order_id == order_id,
            Invoice.is_deleted.is_(False),
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Invoice already exists for this order")

    try:
        invoice = Invoice(
            invoice_number=_invoice_number(session),
            invoice_type=invoice_type,
            order_id=order_id,
            partner_name=data["partner_name"],
            tax_amount=data.get("tax_amount", 0),
            discount_amount=data.get("discount_amount", 0),
            created_by=user_id,
        )
        session.add(invoice)
        session.flush()

        total = 0.0
        for item in data["items"]:
            if item["quantity"] <= 0:
                raise HTTPException(status_code=400, detail="Item quantity must be greater than 0")
            if item["unit_price"] < 0:
                raise HTTPException(status_code=400, detail="Item unit price cannot be negative")

            line_total = item["quantity"] * item["unit_price"]
            total += line_total
            session.add(
                InvoiceItem(
                    invoice_id=invoice.id,
                    product_id=item["product_id"],
                    description=item.get("description"),
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    line_total=line_total,
                )
            )

        invoice.total_amount = total
        invoice.grand_total = total + invoice.tax_amount - invoice.discount_amount
        session.commit()
        session.refresh(invoice)
        return get_invoice(session, invoice.id)
    except Exception:
        session.rollback()
        raise


def create_invoice_from_order(
    session: Session,
    invoice_type: str,
    order_id: int | str,
    user_id: int | None = None,
):
    if invoice_type == "IMPORT":
        order = _find_import_order(session, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Import order not found")
        supplier = session.get(Supplier, order.supplier_id)
        items = session.exec(
            select(ImportOrderItem).where(ImportOrderItem.import_order_id == order.id)
        ).all()
        payload_items = [
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_cost,
                "description": _product_name(session, item.product_id),
            }
            for item in items
        ]
        partner_name = supplier.name if supplier else f"Supplier #{order.supplier_id}"
    elif invoice_type == "EXPORT":
        order = _find_export_order(session, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Export order not found")
        items = session.exec(
            select(ExportOrderItem).where(ExportOrderItem.export_order_id == order.id)
        ).all()
        payload_items = [
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.price,
                "description": _product_name(session, item.product_id),
            }
            for item in items
        ]
        partner_name = order.customer_name
    else:
        raise HTTPException(status_code=400, detail="invoice_type must be IMPORT or EXPORT")

    existing = session.exec(
        select(Invoice).where(
            Invoice.invoice_type == invoice_type,
            Invoice.order_id == order.id,
            Invoice.is_deleted.is_(False),
        )
    ).first()
    if existing:
        return get_invoice(session, existing.id)

    return create_invoice(
        session,
        {
            "invoice_type": invoice_type,
            "order_id": order.id,
            "partner_name": partner_name,
            "items": payload_items,
            "tax_amount": getattr(order, "tax_amount", 0),
        },
        user_id=user_id,
    )


def get_invoice(session: Session, invoice_id: int):
    invoice = session.get(Invoice, invoice_id)
    if not invoice or invoice.is_deleted:
        raise HTTPException(status_code=404, detail="Invoice not found")

    items = session.exec(
        select(InvoiceItem).where(
            InvoiceItem.invoice_id == invoice_id,
            InvoiceItem.is_deleted.is_(False),
        )
    ).all()
    result = invoice.model_dump()
    result["items"] = items
    return result


def list_invoices(session: Session, skip: int = 0, limit: int = 50, search: str | None = None):
    query = select(Invoice).where(Invoice.is_deleted.is_(False))

    if search:
        keyword = f"%{search}%"
        search_filter = (
            (Invoice.invoice_number.ilike(keyword))
            | (Invoice.invoice_type.ilike(keyword))
            | (Invoice.partner_name.ilike(keyword))
            | (Invoice.status.ilike(keyword))
        )
        if search.isdigit() and int(search) <= 2147483647:
            search_filter = search_filter | (Invoice.order_id == int(search))
        query = query.where(search_filter)

    invoices = session.exec(
        query.order_by(Invoice.issued_at.desc()).offset(skip).limit(limit)
    ).all()
    return invoices


def _product_name(session: Session, product_id: int) -> str:
    product = session.get(Product, product_id)
    return product.name if product else f"Product #{product_id}"


def _find_export_order(session: Session, order_id_or_code: int | str):
    order = session.exec(
        select(ExportOrder).where(ExportOrder.order_code == str(order_id_or_code))
    ).first()
    if order:
        return order
    if str(order_id_or_code).isdigit():
        numeric_id = int(order_id_or_code)
        if numeric_id <= 2147483647:
            return session.get(ExportOrder, numeric_id)
    return None


def _find_import_order(session: Session, order_id_or_code: int | str):
    order = session.exec(
        select(ImportOrder).where(ImportOrder.order_code == str(order_id_or_code))
    ).first()
    if order:
        return order
    if str(order_id_or_code).isdigit():
        numeric_id = int(order_id_or_code)
        if numeric_id <= 2147483647:
            return session.get(ImportOrder, numeric_id)
    return None
