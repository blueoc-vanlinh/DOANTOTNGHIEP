import datetime as dt
from sqlmodel import Field
from sqlalchemy import UniqueConstraint
from app.db.base_model import BaseModel


class ForecastResult(BaseModel, table=True):
    __tablename__ = "forecast_results"

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "warehouse_id",
            "forecast_date",
            name="uq_forecast"
        ),
    )

    product_id: int = Field(foreign_key="products.id")
    warehouse_id: int = Field(foreign_key="warehouses.id")

    forecast_date: dt.date = Field(index=True)
    predicted_demand: int
    predicted_stock: int
    days_to_out_of_stock: int
    model_used: str