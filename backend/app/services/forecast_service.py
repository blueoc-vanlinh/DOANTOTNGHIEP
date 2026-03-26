from sqlmodel import Session
from app.models.forecast import ForecastResult


def create_forecast(session: Session, data: dict):
    obj = ForecastResult(**data)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj