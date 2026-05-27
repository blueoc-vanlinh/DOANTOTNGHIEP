"""add import export order types

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-05-25 00:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, Sequence[str], None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    import_indexes = {index["name"] for index in inspector.get_indexes("import_orders")}
    export_indexes = {index["name"] for index in inspector.get_indexes("export_orders")}

    if not _has_column(inspector, "import_orders", "import_type"):
        op.add_column(
            "import_orders",
            sa.Column(
                "import_type",
                sqlmodel.sql.sqltypes.AutoString(),
                nullable=False,
                server_default="PURCHASE",
            ),
        )
    if "ix_import_orders_import_type" not in import_indexes:
        op.create_index(op.f("ix_import_orders_import_type"), "import_orders", ["import_type"])

    if not _has_column(inspector, "export_orders", "export_type"):
        op.add_column(
            "export_orders",
            sa.Column(
                "export_type",
                sqlmodel.sql.sqltypes.AutoString(),
                nullable=False,
                server_default="RETAIL_SALE",
            ),
        )
    if "ix_export_orders_export_type" not in export_indexes:
        op.create_index(op.f("ix_export_orders_export_type"), "export_orders", ["export_type"])


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    import_indexes = {index["name"] for index in inspector.get_indexes("import_orders")}
    export_indexes = {index["name"] for index in inspector.get_indexes("export_orders")}

    if "ix_export_orders_export_type" in export_indexes:
        op.drop_index(op.f("ix_export_orders_export_type"), table_name="export_orders")
    if _has_column(inspector, "export_orders", "export_type"):
        op.drop_column("export_orders", "export_type")

    if "ix_import_orders_import_type" in import_indexes:
        op.drop_index(op.f("ix_import_orders_import_type"), table_name="import_orders")
    if _has_column(inspector, "import_orders", "import_type"):
        op.drop_column("import_orders", "import_type")
