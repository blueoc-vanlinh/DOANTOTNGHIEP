from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.session import get_session
from app.api.deps import require_permissions
from app.schemas.invoice_schema import InvoiceCreate, InvoiceRead
from app.services.invoice_service import (
    create_invoice,
    create_invoice_from_order,
    get_invoice,
    list_invoices,
)
from app.services.momo_service import create_momo_payment

router = APIRouter(tags=["Invoices"])
invoice_access = Depends(require_permissions("view_reports"))


@router.get("/")
def get_invoices(
    _: object = invoice_access,
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    search: str | None = Query(None),
):
    skip = (page - 1) * page_size
    return list_invoices(session, skip=skip, limit=page_size, search=search)


@router.get("/{invoice_id}")
def get_invoice_detail(invoice_id: int, _: object = invoice_access, session: Session = Depends(get_session)):
    return get_invoice(session, invoice_id)


@router.post("/{invoice_id}/momo-payment")
def create_invoice_momo_payment(invoice_id: int, _: object = invoice_access, session: Session = Depends(get_session)):
    invoice = get_invoice(session, invoice_id)
    return create_momo_payment(invoice)


@router.post("/", response_model=InvoiceRead)
def create_invoice_endpoint(
    data: InvoiceCreate,
    _: object = invoice_access,
    session: Session = Depends(get_session),
):
    return create_invoice(session, data.model_dump(), user_id=1)


@router.post("/from-order/{invoice_type}/{order_id}", response_model=InvoiceRead)
def create_invoice_from_order_endpoint(
    invoice_type: str,
    order_id: str,
    _: object = invoice_access,
    session: Session = Depends(get_session),
):
    return create_invoice_from_order(session, invoice_type.upper(), order_id, user_id=1)
