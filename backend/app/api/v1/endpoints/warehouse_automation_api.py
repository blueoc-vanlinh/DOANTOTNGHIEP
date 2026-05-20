from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.session import get_session
from app.services.warehouse_automation_service import (
    get_auto_po_recommendations,
    get_slotting_suggestions,
    lookup_barcode,
)

router = APIRouter(tags=["Warehouse Automation"])


@router.get("/auto-po")
def auto_po_recommendations(
    session: Session = Depends(get_session),
    lead_time_days: int = Query(7, ge=1, le=90),
    coverage_days: int = Query(30, ge=1, le=365),
):
    return get_auto_po_recommendations(
        session,
        lead_time_days=lead_time_days,
        coverage_days=coverage_days,
    )


@router.get("/slotting")
def slotting_suggestions(
    session: Session = Depends(get_session),
    days: int = Query(30, ge=1, le=365),
):
    return get_slotting_suggestions(session, days=days)


@router.get("/barcode/{barcode}")
def barcode_lookup(barcode: str, session: Session = Depends(get_session)):
    return lookup_barcode(session, barcode)
