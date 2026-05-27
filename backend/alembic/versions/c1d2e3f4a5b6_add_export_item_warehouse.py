"""add export item warehouse

Revision ID: c1d2e3f4a5b6
Revises: b2c3d4e5f6a7
Create Date: 2026-05-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c1d2e3f4a5b6"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if not _has_column(inspector, "export_order_items", "warehouse_id"):
        op.add_column("export_order_items", sa.Column("warehouse_id", sa.Integer(), nullable=True))
        op.create_foreign_key(
            "fk_export_order_items_warehouse_id_warehouses",
            "export_order_items",
            "warehouses",
            ["warehouse_id"],
            ["id"],
        )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if _has_column(inspector, "export_order_items", "warehouse_id"):
        op.drop_constraint(
            "fk_export_order_items_warehouse_id_warehouses",
            "export_order_items",
            type_="foreignkey",
        )
        op.drop_column("export_order_items", "warehouse_id")
