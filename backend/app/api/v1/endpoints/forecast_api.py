from fastapi import APIRouter, Depends

from sqlmodel import Session

from app.db.session import get_session

from app.services.forecast_ai_service import (
    ai_forecast_product,
)
from app.services.forecast_training_service import (
    train_all_product_forecasts,
    train_forecast_for_product,
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


@router.post("/train")
def train_all_forecasts(
    horizon_days: int = 30,
    session: Session = Depends(get_session),
):
    return train_all_product_forecasts(
        session=session,
        horizon_days=horizon_days,
    )


@router.post("/train/{product_id}")
def train_product_forecast(
    product_id: int,
    horizon_days: int = 30,
    session: Session = Depends(get_session),
):
    return train_forecast_for_product(
        session=session,
        product_id=product_id,
        horizon_days=horizon_days,
    )
