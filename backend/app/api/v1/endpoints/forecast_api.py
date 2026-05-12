from fastapi import APIRouter, Depends

from sqlmodel import Session

from app.db.session import get_session

from app.services.forecast_ai_service import (
    ai_forecast_product,
)

router = APIRouter( tags=["Forecast AI"])


@router.get("/{product_id}")
def forecast_product(
    product_id: int,
    session: Session = Depends(get_session),
):
    return ai_forecast_product(
        session=session,
        product_id=product_id,
    )