import datetime as dt

from pydantic import BaseModel


class ExternalFactorCreate(BaseModel):
    factor_date: dt.date
    factor_type: str
    name: str
    value: float | None = None
    impact_score: float = 0
    product_id: int | None = None
    warehouse_id: int | None = None
    source: str | None = None
    note: str | None = None
