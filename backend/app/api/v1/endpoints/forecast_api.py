from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session

from app.services.forecast_service import (
    get_forecast_by_product,
)

router = APIRouter( tags=["Forecast"])

@router.get("/{product_id}")
def forecast_product(
    product_id: int,
    session: Session = Depends(get_session),
):
    return get_forecast_by_product(
        session=session,
        product_id=product_id,
    )