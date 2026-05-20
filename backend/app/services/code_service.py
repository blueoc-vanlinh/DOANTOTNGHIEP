from datetime import datetime

from sqlmodel import Session, select

from app.models.exportorder import ExportOrder
from app.models.importorder import ImportOrder
from app.models.invoice import Invoice


def timestamp_code(prefix: str = "", issued_at: datetime | None = None) -> str:
    issued_at = issued_at or datetime.now()
    return f"{prefix}{issued_at:%H%M%d%m%Y}"


def generate_invoice_number(session: Session, issued_at: datetime | None = None) -> str:
    return _unique_code(session, Invoice.invoice_number, timestamp_code("", issued_at))


def generate_import_order_code(session: Session, issued_at: datetime | None = None) -> str:
    return _unique_code(session, ImportOrder.order_code, timestamp_code("0", issued_at))


def generate_export_order_code(session: Session, issued_at: datetime | None = None) -> str:
    return _unique_code(session, ExportOrder.order_code, timestamp_code("0", issued_at))


def _unique_code(session: Session, column, base_code: str) -> str:
    existing = session.exec(select(column).where(column == base_code)).first()
    if not existing:
        return base_code

    suffix = 2
    while True:
        candidate = f"{base_code}-{suffix:02d}"
        existing = session.exec(select(column).where(column == candidate)).first()
        if not existing:
            return candidate
        suffix += 1
