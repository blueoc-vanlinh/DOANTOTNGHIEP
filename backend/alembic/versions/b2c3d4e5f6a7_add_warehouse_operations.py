"""add warehouse operations

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-21 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    if not _has_table(inspector, table_name):
        return False
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())

    if _has_table(inspector, "import_order_items") and not _has_column(inspector, "import_order_items", "warehouse_id"):
        op.add_column("import_order_items", sa.Column("warehouse_id", sa.Integer(), nullable=True))
        op.create_foreign_key(
            "fk_import_order_items_warehouse_id_warehouses",
            "import_order_items",
            "warehouses",
            ["warehouse_id"],
            ["id"],
        )

    if not _has_table(inspector, "storage_bins"):
        op.create_table(
            "storage_bins",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("warehouse_id", sa.Integer(), nullable=False),
            sa.Column("code", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("zone", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("aisle", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("shelf", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("level", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("capacity", sa.Integer(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _has_table(inspector, "inventory_batches"):
        op.create_table(
            "inventory_batches",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("product_id", sa.Integer(), nullable=False),
            sa.Column("warehouse_id", sa.Integer(), nullable=False),
            sa.Column("storage_bin_id", sa.Integer(), nullable=True),
            sa.Column("batch_number", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("serial_number", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("expiry_date", sa.Date(), nullable=True),
            sa.Column("quantity", sa.Integer(), nullable=False),
            sa.Column("is_deleted", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
            sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
            sa.ForeignKeyConstraint(["storage_bin_id"], ["storage_bins.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _has_table(inspector, "return_orders"):
        op.create_table(
            "return_orders",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("return_code", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("return_type", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("related_order_type", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("related_order_id", sa.Integer(), nullable=True),
            sa.Column("customer_name", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("supplier_id", sa.Integer(), nullable=True),
            sa.Column("reason", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("total_amount", sa.Float(), nullable=False),
            sa.Column("created_by", sa.Integer(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(["supplier_id"], ["suppliers.id"]),
            sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("return_code"),
        )

    if not _has_table(inspector, "return_order_items"):
        op.create_table(
            "return_order_items",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("return_order_id", sa.Integer(), nullable=False),
            sa.Column("product_id", sa.Integer(), nullable=False),
            sa.Column("warehouse_id", sa.Integer(), nullable=False),
            sa.Column("quantity", sa.Integer(), nullable=False),
            sa.Column("unit_price", sa.Float(), nullable=False),
            sa.ForeignKeyConstraint(["return_order_id"], ["return_orders.id"]),
            sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
            sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _has_table(inspector, "stocktakes"):
        op.create_table(
            "stocktakes",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("stocktake_code", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("warehouse_id", sa.Integer(), nullable=True),
            sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("note", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("created_by", sa.Integer(), nullable=True),
            sa.Column("approved_by", sa.Integer(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
            sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
            sa.ForeignKeyConstraint(["approved_by"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("stocktake_code"),
        )

    if not _has_table(inspector, "stocktake_items"):
        op.create_table(
            "stocktake_items",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("stocktake_id", sa.Integer(), nullable=False),
            sa.Column("product_id", sa.Integer(), nullable=False),
            sa.Column("warehouse_id", sa.Integer(), nullable=False),
            sa.Column("system_quantity", sa.Integer(), nullable=False),
            sa.Column("counted_quantity", sa.Integer(), nullable=False),
            sa.Column("difference_quantity", sa.Integer(), nullable=False),
            sa.Column("note", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.ForeignKeyConstraint(["stocktake_id"], ["stocktakes.id"]),
            sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
            sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _has_table(inspector, "purchase_orders"):
        op.create_table(
            "purchase_orders",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("po_code", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("supplier_id", sa.Integer(), nullable=False),
            sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("total_amount", sa.Float(), nullable=False),
            sa.Column("note", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("created_by", sa.Integer(), nullable=True),
            sa.Column("approved_by", sa.Integer(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(["supplier_id"], ["suppliers.id"]),
            sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
            sa.ForeignKeyConstraint(["approved_by"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("po_code"),
        )

    if not _has_table(inspector, "purchase_order_items"):
        op.create_table(
            "purchase_order_items",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("purchase_order_id", sa.Integer(), nullable=False),
            sa.Column("product_id", sa.Integer(), nullable=False),
            sa.Column("warehouse_id", sa.Integer(), nullable=False),
            sa.Column("quantity", sa.Integer(), nullable=False),
            sa.Column("unit_cost", sa.Float(), nullable=False),
            sa.Column("received_quantity", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["purchase_order_id"], ["purchase_orders.id"]),
            sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
            sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade() -> None:
    for table_name in [
        "purchase_order_items",
        "purchase_orders",
        "stocktake_items",
        "stocktakes",
        "return_order_items",
        "return_orders",
        "inventory_batches",
        "storage_bins",
    ]:
        op.drop_table(table_name)
