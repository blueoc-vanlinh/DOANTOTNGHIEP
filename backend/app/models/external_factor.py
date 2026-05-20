import datetime as dt

from sqlalchemy import Boolean, Column
from sqlmodel import Field

from app.db.base_model import BaseModel


class ExternalFactor(BaseModel, table=True):
    __tablename__ = "external_factors"

    factor_date: dt.date = Field(index=True)
    factor_type: str = Field(index=True)
    name: str
    value: float | None = None
    impact_score: float = 0
    product_id: int | None = Field(default=None, foreign_key="products.id")
    warehouse_id: int | None = Field(default=None, foreign_key="warehouses.id")
    source: str | None = None
    note: str | None = None
    is_deleted: bool = Field(
        default=False,
        sa_column=Column(Boolean, default=False, index=True),
    )
