from datetime import date

from fastapi import APIRouter, Query
from fastapi import Depends

from sqlmodel import Session

from app.db.session import get_session

from app.services.dashboard_service import (
    get_dashboard_summary,
)

router = APIRouter()


@router.get("/")
def dashboard(
    period: str = Query("day", pattern="^(day|month|year)$"),
    target_date: date | None = Query(None),
    target_month: str | None = Query(None, description="YYYY-MM"),
    target_year: int | None = Query(None, ge=2000, le=2100),
    session: Session = Depends(
        get_session
    ),
):
    return get_dashboard_summary(
        session,
        period=period,
        target_date=target_date,
        target_month=target_month,
        target_year=target_year,
    )
