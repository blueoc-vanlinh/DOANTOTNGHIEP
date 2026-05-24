from sqlmodel import Session

from app.db.session import engine
from app.services.forecast_training_service import train_all_product_forecasts


def main():
    with Session(engine) as session:
        summary = train_all_product_forecasts(session=session, horizon_days=30)

    print("Forecast training completed")
    print(f"Products total: {summary['products_total']}")
    print(f"Products trained: {summary['products_trained']}")
    print(f"Rows upserted: {summary['rows_upserted']}")


if __name__ == "__main__":
    main()
