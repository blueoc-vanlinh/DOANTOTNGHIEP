from fastapi import APIRouter
from fastapi import Depends

from sqlmodel import Session

from app.db.session import get_session

from app.services.dashboard_service import (
    get_dashboard_summary,
)

router = APIRouter()


@router.get("/")
def dashboard(
    session: Session = Depends(
        get_session
    ),
):
    return get_dashboard_summary(
        session
    )