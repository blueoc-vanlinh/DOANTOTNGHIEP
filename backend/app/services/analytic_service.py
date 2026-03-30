from sqlmodel import Session, select
from app.models.analytic import DailyInventoryStats


def get_stats(session: Session):
    return session.exec(select(DailyInventoryStats)).all()