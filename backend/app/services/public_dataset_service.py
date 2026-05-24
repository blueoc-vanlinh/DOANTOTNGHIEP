from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from pathlib import Path
from typing import Iterable

import pandas as pd

from app.models.external_factor import ExternalFactor
from app.models.product import Product
from app.models.transaction import StockTransaction
from app.models.user import User
from app.models.warehouse import Warehouse

DEFAULT_DATASET_DIR = Path(__file__).resolve().parents[3] / "dataset"


@dataclass
class DatasetSeedBundle:
    transactions: list[StockTransaction]
    external_factors: list[ExternalFactor]
    metadata: dict[str, int]


def dataset_bundle_available(dataset_dir: Path | None = None) -> bool:
    root = dataset_dir or DEFAULT_DATASET_DIR
    required_files = [
        root / "calendar.csv",
        root / "sales_train_evaluation.csv",
        root / "Walmart.csv",
        root / "train.csv",
    ]
    return all(path.exists() for path in required_files)


def build_public_dataset_seed_bundle(
    *,
    products: list[Product],
    warehouses: list[Warehouse],
    users: list[User],
    dataset_dir: Path | None = None,
    history_days: int = 420,
    max_products: int = 12,
) -> DatasetSeedBundle:
    root = dataset_dir or DEFAULT_DATASET_DIR
    transactions, transaction_meta = _build_transactions_from_m5(
        products=products,
        warehouses=warehouses,
        users=users,
        dataset_dir=root,
        history_days=history_days,
        max_products=max_products,
    )
    external_factors, factor_meta = _build_external_factors_from_public_data(
        products=products,
        warehouses=warehouses,
        dataset_dir=root,
        history_days=history_days,
    )
    metadata = {**transaction_meta, **factor_meta}
    return DatasetSeedBundle(
        transactions=transactions,
        external_factors=external_factors,
        metadata=metadata,
    )


def build_public_dataset_transactions(
    *,
    products: list[Product],
    warehouses: list[Warehouse],
    users: list[User],
    dataset_dir: Path | None = None,
    history_days: int = 420,
    max_products: int = 12,
) -> list[StockTransaction]:
    root = dataset_dir or DEFAULT_DATASET_DIR
    transactions, _ = _build_transactions_from_m5(
        products=products,
        warehouses=warehouses,
        users=users,
        dataset_dir=root,
        history_days=history_days,
        max_products=max_products,
    )
    return transactions


def build_public_dataset_external_factors(
    *,
    products: list[Product],
    warehouses: list[Warehouse],
    dataset_dir: Path | None = None,
    history_days: int = 420,
) -> list[ExternalFactor]:
    root = dataset_dir or DEFAULT_DATASET_DIR
    external_factors, _ = _build_external_factors_from_public_data(
        products=products,
        warehouses=warehouses,
        dataset_dir=root,
        history_days=history_days,
    )
    return external_factors


def _build_transactions_from_m5(
    *,
    products: list[Product],
    warehouses: list[Warehouse],
    users: list[User],
    dataset_dir: Path,
    history_days: int,
    max_products: int,
) -> tuple[list[StockTransaction], dict[str, int]]:
    calendar = pd.read_csv(
        dataset_dir / "calendar.csv",
        usecols=["date", "d", "wm_yr_wk"],
    )
    calendar["date"] = pd.to_datetime(calendar["date"])
    recent_calendar = calendar.tail(history_days).copy()
    recent_day_ids = recent_calendar["d"].tolist()

    sales = pd.read_csv(
        dataset_dir / "sales_train_evaluation.csv",
        usecols=["item_id", "dept_id", "cat_id", "store_id", "state_id", *recent_day_ids],
        nrows=max_products * 4,
    )
    sales["total_recent_sales"] = sales[recent_day_ids].sum(axis=1)
    selected = sales.sort_values("total_recent_sales", ascending=False).head(
        min(max_products, len(products))
    )

    long_sales = selected.melt(
        id_vars=["item_id", "dept_id", "cat_id", "store_id", "state_id"],
        value_vars=recent_day_ids,
        var_name="d",
        value_name="sales",
    )
    long_sales = long_sales[long_sales["sales"] > 0].merge(
        recent_calendar,
        on="d",
        how="left",
    )
    long_sales["mapped_date"] = _map_dates_to_recent_window(
        long_sales["date"],
        anchor_end=date.today() - timedelta(days=1),
    )

    transactions: list[StockTransaction] = []
    mapped_product_count = 0

    for product_index, (_, item_row) in enumerate(selected.iterrows()):
        if product_index >= len(products):
            break

        product = products[product_index]
        warehouse = warehouses[product_index % len(warehouses)]
        product_sales = long_sales[long_sales["item_id"] == item_row["item_id"]].sort_values(
            ["mapped_date", "d"]
        )
        if product_sales.empty:
            continue

        recent_avg = max(float(product_sales["sales"].tail(30).mean() or 1.0), 1.0)
        reorder_point = max(int(recent_avg * 10), 60)
        restock_quantity = max(int(recent_avg * 28), reorder_point + 40)
        balance = max(int(recent_avg * 45), 280)
        mapped_product_count += 1

        for row_number, sale_row in enumerate(product_sales.itertuples(), start=1):
            sale_quantity = int(max(float(sale_row.sales), 0))
            if sale_quantity <= 0:
                continue

            balance = max(balance - sale_quantity, 0)
            export_time = datetime.combine(
                sale_row.mapped_date,
                time(hour=(row_number % 8) + 9, minute=(product_index * 7) % 60),
            )
            transactions.append(
                StockTransaction(
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    type="EXPORT",
                    quantity=sale_quantity,
                    balance_after=balance,
                    reference_type="PUBLIC_M5_SALES",
                    reference_id=row_number,
                    created_by=users[5].id,
                    note=(
                        f"M5 item {sale_row.item_id} | dept={sale_row.dept_id} "
                        f"| store={sale_row.store_id}"
                    ),
                    created_at=export_time,
                )
            )

            if balance <= reorder_point:
                balance += restock_quantity
                transactions.append(
                    StockTransaction(
                        product_id=product.id,
                        warehouse_id=warehouse.id,
                        type="IMPORT",
                        quantity=restock_quantity,
                        balance_after=balance,
                        reference_type="PUBLIC_M5_REPLENISH",
                        reference_id=row_number,
                        created_by=users[4].id,
                        note=f"Hybrid replenishment from M5 demand profile for {sale_row.item_id}",
                        created_at=export_time + timedelta(hours=4),
                    )
                )

    return transactions, {
        "dataset_transaction_products": mapped_product_count,
        "dataset_transactions": len(transactions),
    }


def _build_external_factors_from_public_data(
    *,
    products: list[Product],
    warehouses: list[Warehouse],
    dataset_dir: Path,
    history_days: int,
) -> tuple[list[ExternalFactor], dict[str, int]]:
    factors: list[ExternalFactor] = []
    factors.extend(
        _build_m5_calendar_factors(
            dataset_dir=dataset_dir,
            products=products,
            warehouses=warehouses,
            history_days=history_days,
        )
    )
    factors.extend(
        _build_walmart_macro_factors(
            dataset_dir=dataset_dir,
            products=products,
            warehouses=warehouses,
            history_days=history_days,
        )
    )
    factors.extend(
        _build_rossmann_operational_factors(
            dataset_dir=dataset_dir,
            products=products,
            warehouses=warehouses,
            history_days=history_days,
        )
    )
    factors.extend(_build_vn_future_calendar_factors(products=products, warehouses=warehouses))
    return factors, {"dataset_external_factors": len(factors)}


def _build_m5_calendar_factors(
    *,
    dataset_dir: Path,
    products: list[Product],
    warehouses: list[Warehouse],
    history_days: int,
) -> list[ExternalFactor]:
    calendar = pd.read_csv(
        dataset_dir / "calendar.csv",
        usecols=[
            "date",
            "event_name_1",
            "event_type_1",
            "event_name_2",
            "event_type_2",
            "snap_CA",
            "snap_TX",
            "snap_WI",
        ],
    ).tail(history_days)
    calendar["date"] = pd.to_datetime(calendar["date"])
    calendar["mapped_date"] = _map_dates_to_recent_window(
        calendar["date"],
        anchor_end=date.today() - timedelta(days=1),
    )

    factors: list[ExternalFactor] = []
    for row in calendar.itertuples():
        if pd.notna(row.event_name_1):
            factors.append(
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="HOLIDAY_VN",
                    name=f"M5 event: {row.event_name_1}",
                    value=1.0,
                    impact_score=10 if str(row.event_type_1).lower() == "cultural" else 6,
                    product_id=None,
                    warehouse_id=None,
                    source="M5 calendar.csv",
                    note="Public event signal remapped into current training timeline",
                )
            )
        if pd.notna(row.event_name_2):
            factors.append(
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="HOLIDAY_VN",
                    name=f"M5 event: {row.event_name_2}",
                    value=1.0,
                    impact_score=8,
                    product_id=None,
                    warehouse_id=None,
                    source="M5 calendar.csv",
                    note="Secondary retail event from M5 calendar",
                )
            )

        snap_strength = float(row.snap_CA + row.snap_TX + row.snap_WI)
        if snap_strength > 0:
            product = products[int(snap_strength) % min(len(products), 12)]
            warehouse = warehouses[int(snap_strength) % len(warehouses)]
            factors.append(
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="ECOMMERCE_TREND",
                    name="Demand support / SNAP effect",
                    value=snap_strength,
                    impact_score=round(2.5 * snap_strength, 2),
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    source="M5 calendar.csv",
                    note="Demand support proxy derived from SNAP flags",
                )
            )
    return factors


def _build_walmart_macro_factors(
    *,
    dataset_dir: Path,
    products: list[Product],
    warehouses: list[Warehouse],
    history_days: int,
) -> list[ExternalFactor]:
    walmart = pd.read_csv(
        dataset_dir / "Walmart.csv",
        usecols=["Date", "Holiday_Flag", "Temperature", "Fuel_Price", "CPI", "Unemployment"],
    )
    walmart["Date"] = pd.to_datetime(walmart["Date"], format="%d-%m-%Y")
    weekly = (
        walmart.groupby("Date", as_index=False)
        .agg(
            Holiday_Flag=("Holiday_Flag", "max"),
            Temperature=("Temperature", "mean"),
            Fuel_Price=("Fuel_Price", "mean"),
            CPI=("CPI", "mean"),
            Unemployment=("Unemployment", "mean"),
        )
        .tail(max(history_days // 7, 52))
    )
    weekly["mapped_date"] = _map_dates_to_recent_window(
        weekly["Date"],
        anchor_end=date.today() - timedelta(days=1),
    )

    fuel_mean = float(weekly["Fuel_Price"].mean() or 0)
    cpi_mean = float(weekly["CPI"].mean() or 0)
    temp_mean = float(weekly["Temperature"].mean() or 0)

    factors: list[ExternalFactor] = []
    for index, row in enumerate(weekly.itertuples(), start=1):
        product = products[index % min(len(products), 12)]
        warehouse = warehouses[index % len(warehouses)]

        factors.extend(
            [
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="FUEL_PRICE",
                    name="Fuel price trend",
                    value=float(row.Fuel_Price),
                    impact_score=round((float(row.Fuel_Price) - fuel_mean) * -6, 2),
                    product_id=None,
                    warehouse_id=warehouse.id,
                    source="Walmart.csv",
                    note="Logistics cost proxy from Walmart fuel price series",
                ),
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="CPI",
                    name="Inflation / CPI trend",
                    value=float(row.CPI),
                    impact_score=round((float(row.CPI) - cpi_mean) * -0.4, 2),
                    product_id=None,
                    warehouse_id=None,
                    source="Walmart.csv",
                    note="Macro inflation proxy from Walmart CPI series",
                ),
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="WEATHER",
                    name="Weather comfort index",
                    value=float(row.Temperature),
                    impact_score=round((float(row.Temperature) - temp_mean) * 0.2, 2),
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    source="Walmart.csv",
                    note="Weather signal remapped from Walmart temperature series",
                ),
            ]
        )

        if int(row.Holiday_Flag) == 1:
            factors.append(
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="HOLIDAY_VN",
                    name="Holiday retail spike proxy",
                    value=1,
                    impact_score=12,
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    source="Walmart.csv",
                    note="Retail holiday uplift based on Walmart holiday weeks",
                )
            )
    return factors


def _build_rossmann_operational_factors(
    *,
    dataset_dir: Path,
    products: list[Product],
    warehouses: list[Warehouse],
    history_days: int,
) -> list[ExternalFactor]:
    rossmann = pd.read_csv(
        dataset_dir / "train.csv",
        usecols=["Date", "Sales", "Customers", "Promo", "StateHoliday", "SchoolHoliday"],
    )
    rossmann["Date"] = pd.to_datetime(rossmann["Date"])
    daily = (
        rossmann.groupby("Date", as_index=False)
        .agg(
            Sales=("Sales", "mean"),
            Customers=("Customers", "mean"),
            Promo=("Promo", "mean"),
            SchoolHoliday=("SchoolHoliday", "mean"),
            StateHoliday=("StateHoliday", lambda s: (s.astype(str) != "0").mean()),
        )
        .tail(history_days)
    )
    daily["mapped_date"] = _map_dates_to_recent_window(
        daily["Date"],
        anchor_end=date.today() - timedelta(days=1),
    )

    sales_mean = float(daily["Sales"].mean() or 0)
    customer_mean = float(daily["Customers"].mean() or 0)
    factors: list[ExternalFactor] = []

    for index, row in enumerate(daily.itertuples(), start=1):
        product = products[index % min(len(products), 12)]
        warehouse = warehouses[index % len(warehouses)]

        if float(row.Promo) > 0:
            factors.append(
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="ECOMMERCE_TREND",
                    name="Promo traffic uplift",
                    value=float(row.Promo),
                    impact_score=round((float(row.Customers) - customer_mean) / max(customer_mean, 1) * 15, 2),
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    source="Rossmann train.csv",
                    note="Traffic uplift proxy from Rossmann promo/customer behaviour",
                )
            )

        if float(row.SchoolHoliday) > 0:
            factors.append(
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="HOLIDAY_VN",
                    name="School holiday demand pattern",
                    value=float(row.SchoolHoliday),
                    impact_score=7,
                    product_id=None,
                    warehouse_id=None,
                    source="Rossmann train.csv",
                    note="School holiday demand signal from Rossmann",
                )
            )

        if float(row.StateHoliday) > 0:
            factors.append(
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="HOLIDAY_VN",
                    name="State holiday demand pattern",
                    value=float(row.StateHoliday),
                    impact_score=9,
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    source="Rossmann train.csv",
                    note="Public holiday signal from Rossmann",
                )
            )

        if index % 14 == 0:
            factors.append(
                ExternalFactor(
                    factor_date=row.mapped_date,
                    factor_type="MARKET",
                    name="Retail demand momentum",
                    value=float(row.Sales),
                    impact_score=round((float(row.Sales) - sales_mean) / max(sales_mean, 1) * 10, 2),
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    source="Rossmann train.csv",
                    note="Retail sales momentum proxy for internal demand planning",
                )
            )
    return factors


def _build_vn_future_calendar_factors(
    *,
    products: list[Product],
    warehouses: list[Warehouse],
    days_ahead: int = 60,
) -> list[ExternalFactor]:
    today = date.today()
    future_dates = [today + timedelta(days=offset) for offset in range(1, days_ahead + 1)]
    factors: list[ExternalFactor] = []

    fixed_holidays = {
        "01-01": ("Tết Dương lịch", 10),
        "04-30": ("Giải phóng miền Nam", 12),
        "05-01": ("Quốc tế Lao động", 11),
        "09-02": ("Quốc khánh", 13),
    }

    for index, day in enumerate(future_dates, start=1):
        if day.strftime("%m-%d") in fixed_holidays:
            holiday_name, impact = fixed_holidays[day.strftime("%m-%d")]
            product = products[index % min(len(products), 12)]
            warehouse = warehouses[index % len(warehouses)]
            factors.append(
                ExternalFactor(
                    factor_date=day,
                    factor_type="HOLIDAY_VN",
                    name=holiday_name,
                    value=1,
                    impact_score=impact,
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    source="VN calendar synthetic",
                    note="Vietnam holiday calendar seeded for future forecast horizon",
                )
            )

        if day.weekday() in (5, 6):
            product = products[index % min(len(products), 12)]
            factors.append(
                ExternalFactor(
                    factor_date=day,
                    factor_type="ECOMMERCE_TREND",
                    name="Weekend traffic uplift",
                    value=1,
                    impact_score=4.5,
                    product_id=product.id,
                    warehouse_id=None,
                    source="Hybrid synthetic",
                    note="Weekend traffic proxy for short-term forecast horizon",
                )
            )
    return factors


def _map_dates_to_recent_window(
    dates: Iterable[pd.Timestamp],
    *,
    anchor_end: date,
) -> list[date]:
    unique_dates = sorted(pd.Timestamp(item).date() for item in dates)
    remapped = {
        original: anchor_end - timedelta(days=len(unique_dates) - index - 1)
        for index, original in enumerate(unique_dates)
    }
    return [remapped[pd.Timestamp(item).date()] for item in dates]
