"""add invoice payment status

Revision ID: 9af8d21c0b62
Revises: 7e3a2f9b6c10
Create Date: 2026-05-20 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


revision: str = "9af8d21c0b62"
down_revision: Union[str, Sequence[str], None] = "7e3a2f9b6c10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("invoices")}

    if "payment_status" not in columns:
        op.add_column(
            "invoices",
            sa.Column(
                "payment_status",
                sqlmodel.sql.sqltypes.AutoString(),
                nullable=False,
                server_default="UNPAID",
            ),
        )
    if "momo_trans_id" not in columns:
        op.add_column(
            "invoices",
            sa.Column("momo_trans_id", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("invoices")}

    if "momo_trans_id" in columns:
        op.drop_column("invoices", "momo_trans_id")
    if "payment_status" in columns:
        op.drop_column("invoices", "payment_status")
