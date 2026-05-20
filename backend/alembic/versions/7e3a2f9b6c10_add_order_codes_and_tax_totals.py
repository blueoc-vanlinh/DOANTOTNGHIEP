"""add order codes and tax totals

Revision ID: 7e3a2f9b6c10
Revises: 58b2c1e4d2af
Create Date: 2026-05-20 14:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


revision: str = "7e3a2f9b6c10"
down_revision: Union[str, Sequence[str], None] = "58b2c1e4d2af"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    export_columns = {column["name"] for column in inspector.get_columns("export_orders")}
    import_columns = {column["name"] for column in inspector.get_columns("import_orders")}
    export_indexes = {index["name"] for index in inspector.get_indexes("export_orders")}
    import_indexes = {index["name"] for index in inspector.get_indexes("import_orders")}

    if "order_code" not in export_columns:
        op.add_column("export_orders", sa.Column("order_code", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    if "tax_amount" not in export_columns:
        op.add_column("export_orders", sa.Column("tax_amount", sa.Float(), nullable=False, server_default="0"))
    if "grand_total" not in export_columns:
        op.add_column("export_orders", sa.Column("grand_total", sa.Float(), nullable=False, server_default="0"))
    op.execute(
        """
        WITH numbered AS (
            SELECT id,
                   '0' || to_char(created_at, 'HH24MIDDMMYYYY') AS base_code,
                   row_number() OVER (
                       PARTITION BY to_char(created_at, 'HH24MIDDMMYYYY')
                       ORDER BY id
                   ) AS rn
            FROM export_orders
            WHERE order_code IS NULL
        )
        UPDATE export_orders eo
        SET order_code = CASE
            WHEN numbered.rn = 1 THEN numbered.base_code
            ELSE numbered.base_code || '-' || lpad(numbered.rn::text, 2, '0')
        END
        FROM numbered
        WHERE eo.id = numbered.id
        """
    )
    if "ix_export_orders_order_code" not in export_indexes:
        op.create_index(op.f("ix_export_orders_order_code"), "export_orders", ["order_code"], unique=True)

    if "order_code" not in import_columns:
        op.add_column("import_orders", sa.Column("order_code", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    if "tax_amount" not in import_columns:
        op.add_column("import_orders", sa.Column("tax_amount", sa.Float(), nullable=False, server_default="0"))
    if "grand_total" not in import_columns:
        op.add_column("import_orders", sa.Column("grand_total", sa.Float(), nullable=False, server_default="0"))
    op.execute(
        """
        WITH numbered AS (
            SELECT id,
                   '0' || to_char(created_at, 'HH24MIDDMMYYYY') AS base_code,
                   row_number() OVER (
                       PARTITION BY to_char(created_at, 'HH24MIDDMMYYYY')
                       ORDER BY id
                   ) AS rn
            FROM import_orders
            WHERE order_code IS NULL
        )
        UPDATE import_orders io
        SET order_code = CASE
            WHEN numbered.rn = 1 THEN numbered.base_code
            ELSE numbered.base_code || '-' || lpad(numbered.rn::text, 2, '0')
        END
        FROM numbered
        WHERE io.id = numbered.id
        """
    )
    if "ix_import_orders_order_code" not in import_indexes:
        op.create_index(op.f("ix_import_orders_order_code"), "import_orders", ["order_code"], unique=True)


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    export_columns = {column["name"] for column in inspector.get_columns("export_orders")}
    import_columns = {column["name"] for column in inspector.get_columns("import_orders")}
    export_indexes = {index["name"] for index in inspector.get_indexes("export_orders")}
    import_indexes = {index["name"] for index in inspector.get_indexes("import_orders")}

    if "ix_import_orders_order_code" in import_indexes:
        op.drop_index(op.f("ix_import_orders_order_code"), table_name="import_orders")
    if "grand_total" in import_columns:
        op.drop_column("import_orders", "grand_total")
    if "tax_amount" in import_columns:
        op.drop_column("import_orders", "tax_amount")
    if "order_code" in import_columns:
        op.drop_column("import_orders", "order_code")

    if "ix_export_orders_order_code" in export_indexes:
        op.drop_index(op.f("ix_export_orders_order_code"), table_name="export_orders")
    if "grand_total" in export_columns:
        op.drop_column("export_orders", "grand_total")
    if "tax_amount" in export_columns:
        op.drop_column("export_orders", "tax_amount")
    if "order_code" in export_columns:
        op.drop_column("export_orders", "order_code")
