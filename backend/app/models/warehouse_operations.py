from datetime import date

from sqlalchemy import Boolean, Column
from sqlmodel import Field

from app.db.base_model import BaseModel


class StorageBin(BaseModel, table=True):
    __tablename__ = "storage_bins"

    warehouse_id: int = Field(foreign_key="warehouses.id", index=True)
    code: str = Field(index=True)
    zone: str | None = None
    aisle: str | None = None
    shelf: str | None = None
    level: str | None = None
    capacity: int | None = None
    is_deleted: bool = Field(default=False, sa_column=Column(Boolean, default=False, index=True))


class InventoryBatch(BaseModel, table=True):
    __tablename__ = "inventory_batches"

    product_id: int = Field(foreign_key="products.id", index=True)
    warehouse_id: int = Field(foreign_key="warehouses.id", index=True)
    storage_bin_id: int | None = Field(default=None, foreign_key="storage_bins.id")
    batch_number: str | None = Field(default=None, index=True)
    serial_number: str | None = Field(default=None, index=True)
    expiry_date: date | None = None
    quantity: int = 0
    is_deleted: bool = Field(default=False, sa_column=Column(Boolean, default=False, index=True))


class ReturnOrder(BaseModel, table=True):
    __tablename__ = "return_orders"

    return_code: str = Field(unique=True, index=True)
    return_type: str = Field(index=True)  # CUSTOMER_RETURN, SUPPLIER_RETURN
    related_order_type: str | None = None
    related_order_id: int | None = None
    customer_name: str | None = None
    supplier_id: int | None = Field(default=None, foreign_key="suppliers.id")
    reason: str | None = None
    status: str = Field(default="COMPLETED", index=True)
    total_amount: float = 0
    created_by: int | None = Field(default=None, foreign_key="users.id")
    is_deleted: bool = Field(default=False, sa_column=Column(Boolean, default=False, index=True))


class ReturnOrderItem(BaseModel, table=True):
    __tablename__ = "return_order_items"

    return_order_id: int = Field(foreign_key="return_orders.id", index=True)
    product_id: int = Field(foreign_key="products.id")
    warehouse_id: int = Field(foreign_key="warehouses.id")
    quantity: int
    unit_price: float = 0


class Stocktake(BaseModel, table=True):
    __tablename__ = "stocktakes"

    stocktake_code: str = Field(unique=True, index=True)
    warehouse_id: int | None = Field(default=None, foreign_key="warehouses.id")
    status: str = Field(default="DRAFT", index=True)  # DRAFT, APPROVED, COMPLETED, CANCELLED
    note: str | None = None
    created_by: int | None = Field(default=None, foreign_key="users.id")
    approved_by: int | None = Field(default=None, foreign_key="users.id")
    is_deleted: bool = Field(default=False, sa_column=Column(Boolean, default=False, index=True))


class StocktakeItem(BaseModel, table=True):
    __tablename__ = "stocktake_items"

    stocktake_id: int = Field(foreign_key="stocktakes.id", index=True)
    product_id: int = Field(foreign_key="products.id")
    warehouse_id: int = Field(foreign_key="warehouses.id")
    system_quantity: int
    counted_quantity: int
    difference_quantity: int
    note: str | None = None


class PurchaseOrder(BaseModel, table=True):
    __tablename__ = "purchase_orders"

    po_code: str = Field(unique=True, index=True)
    supplier_id: int = Field(foreign_key="suppliers.id")
    status: str = Field(default="DRAFT", index=True)  # DRAFT, APPROVED, RECEIVED, CANCELLED
    total_amount: float = 0
    note: str | None = None
    created_by: int | None = Field(default=None, foreign_key="users.id")
    approved_by: int | None = Field(default=None, foreign_key="users.id")
    is_deleted: bool = Field(default=False, sa_column=Column(Boolean, default=False, index=True))


class PurchaseOrderItem(BaseModel, table=True):
    __tablename__ = "purchase_order_items"

    purchase_order_id: int = Field(foreign_key="purchase_orders.id", index=True)
    product_id: int = Field(foreign_key="products.id")
    warehouse_id: int = Field(foreign_key="warehouses.id")
    quantity: int
    unit_cost: float
    received_quantity: int = 0
