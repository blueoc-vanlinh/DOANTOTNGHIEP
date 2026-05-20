from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.invoice_schema import InvoiceCreate, InvoiceRead
from app.services.invoice_service import (
    create_invoice,
    create_invoice_from_order,
    get_invoice,
    list_invoices,
)

router = APIRouter(tags=["Invoices"])


@router.get("/")
def get_invoices(
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    skip = (page - 1) * page_size
    return list_invoices(session, skip=skip, limit=page_size)


@router.get("/{invoice_id}")
def get_invoice_detail(invoice_id: int, session: Session = Depends(get_session)):
    return get_invoice(session, invoice_id)


@router.post("/", response_model=InvoiceRead)
def create_invoice_endpoint(
    data: InvoiceCreate,
    session: Session = Depends(get_session),
):
    return create_invoice(session, data.model_dump(), user_id=1)


@router.post("/from-order/{invoice_type}/{order_id}", response_model=InvoiceRead)
def create_invoice_from_order_endpoint(
    invoice_type: str,
    order_id: int,
    session: Session = Depends(get_session),
):
    return create_invoice_from_order(session, invoice_type.upper(), order_id, user_id=1)
