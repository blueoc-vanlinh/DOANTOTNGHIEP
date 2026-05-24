from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
DATASET_DIR = ROOT / "dataset"
OUTPUT_DIR = DATASET_DIR / "splits"
TRAIN_RATIO = 0.8


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, dict] = {}

    manifest["m5"] = split_m5()
    manifest["walmart"] = split_walmart()
    manifest["rossmann"] = split_rossmann()

    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Split datasets created at: {OUTPUT_DIR}")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


def split_m5() -> dict:
    source_dir = OUTPUT_DIR / "m5"
    source_dir.mkdir(parents=True, exist_ok=True)

    calendar = pd.read_csv(DATASET_DIR / "calendar.csv")
    calendar["date"] = pd.to_datetime(calendar["date"])
    sales_columns = pd.read_csv(
        DATASET_DIR / "sales_train_evaluation.csv",
        nrows=0,
    ).columns.tolist()
    available_day_ids = {column for column in sales_columns if column.startswith("d_")}
    calendar = (
        calendar[calendar["d"].isin(available_day_ids)]
        .sort_values("date")
        .reset_index(drop=True)
    )

    split_index = max(1, int(len(calendar) * TRAIN_RATIO))
    if split_index >= len(calendar):
        split_index = len(calendar) - 1

    calendar_train = calendar.iloc[:split_index].copy()
    calendar_test = calendar.iloc[split_index:].copy()

    calendar_train.to_csv(source_dir / "calendar_train.csv", index=False)
    calendar_test.to_csv(source_dir / "calendar_test.csv", index=False)

    train_day_ids = calendar_train["d"].tolist()
    test_day_ids = calendar_test["d"].tolist()
    metadata_cols = ["id", "item_id", "dept_id", "cat_id", "store_id", "state_id"]

    sales = pd.read_csv(DATASET_DIR / "sales_train_evaluation.csv")
    sales_train = sales[metadata_cols + train_day_ids]
    sales_test = sales[metadata_cols + test_day_ids]
    sales_train.to_csv(source_dir / "sales_train.csv", index=False)
    sales_test.to_csv(source_dir / "sales_test.csv", index=False)

    train_weeks = set(calendar_train["wm_yr_wk"].dropna().astype(int).tolist())
    test_weeks = set(calendar_test["wm_yr_wk"].dropna().astype(int).tolist())
    sell_prices = pd.read_csv(DATASET_DIR / "sell_prices.csv")
    sell_prices["wm_yr_wk"] = sell_prices["wm_yr_wk"].astype(int)
    sell_prices_train = sell_prices[sell_prices["wm_yr_wk"].isin(train_weeks)].copy()
    sell_prices_test = sell_prices[sell_prices["wm_yr_wk"].isin(test_weeks)].copy()
    sell_prices_train.to_csv(source_dir / "sell_prices_train.csv", index=False)
    sell_prices_test.to_csv(source_dir / "sell_prices_test.csv", index=False)

    return {
        "split_type": "chronological_columns",
        "train_ratio": TRAIN_RATIO,
        "calendar_train_rows": int(len(calendar_train)),
        "calendar_test_rows": int(len(calendar_test)),
        "sales_train_day_columns": len(train_day_ids),
        "sales_test_day_columns": len(test_day_ids),
        "sales_product_rows": int(len(sales)),
        "sell_prices_train_rows": int(len(sell_prices_train)),
        "sell_prices_test_rows": int(len(sell_prices_test)),
        "paths": {
            "calendar_train": str(source_dir / "calendar_train.csv"),
            "calendar_test": str(source_dir / "calendar_test.csv"),
            "sales_train": str(source_dir / "sales_train.csv"),
            "sales_test": str(source_dir / "sales_test.csv"),
            "sell_prices_train": str(source_dir / "sell_prices_train.csv"),
            "sell_prices_test": str(source_dir / "sell_prices_test.csv"),
        },
    }


def split_walmart() -> dict:
    source_dir = OUTPUT_DIR / "walmart"
    source_dir.mkdir(parents=True, exist_ok=True)

    walmart = pd.read_csv(DATASET_DIR / "Walmart.csv")
    walmart["Date"] = pd.to_datetime(walmart["Date"], format="%d-%m-%Y", errors="coerce")
    walmart = walmart.sort_values(["Date", "Store"]).reset_index(drop=True)

    split_index = max(1, int(len(walmart) * TRAIN_RATIO))
    if split_index >= len(walmart):
        split_index = len(walmart) - 1

    walmart_train = walmart.iloc[:split_index].copy()
    walmart_test = walmart.iloc[split_index:].copy()
    walmart_train.to_csv(source_dir / "train.csv", index=False)
    walmart_test.to_csv(source_dir / "test.csv", index=False)

    return {
        "split_type": "chronological_rows",
        "train_ratio": TRAIN_RATIO,
        "train_rows": int(len(walmart_train)),
        "test_rows": int(len(walmart_test)),
        "paths": {
            "train": str(source_dir / "train.csv"),
            "test": str(source_dir / "test.csv"),
        },
    }


def split_rossmann() -> dict:
    source_dir = OUTPUT_DIR / "rossmann"
    source_dir.mkdir(parents=True, exist_ok=True)

    rossmann_train = pd.read_csv(DATASET_DIR / "train.csv")
    rossmann_train["Date"] = pd.to_datetime(rossmann_train["Date"], errors="coerce")
    rossmann_train = rossmann_train.sort_values(["Date", "Store"]).reset_index(drop=True)

    split_index = max(1, int(len(rossmann_train) * TRAIN_RATIO))
    if split_index >= len(rossmann_train):
        split_index = len(rossmann_train) - 1

    train_split = rossmann_train.iloc[:split_index].copy()
    test_split = rossmann_train.iloc[split_index:].copy()
    train_split.to_csv(source_dir / "train.csv", index=False)
    test_split.to_csv(source_dir / "test.csv", index=False)

    store = pd.read_csv(DATASET_DIR / "store.csv")
    store.to_csv(source_dir / "store.csv", index=False)

    return {
        "split_type": "chronological_rows",
        "train_ratio": TRAIN_RATIO,
        "train_rows": int(len(train_split)),
        "test_rows": int(len(test_split)),
        "store_rows": int(len(store)),
        "paths": {
            "train": str(source_dir / "train.csv"),
            "test": str(source_dir / "test.csv"),
            "store": str(source_dir / "store.csv"),
        },
    }


if __name__ == "__main__":
    main()
