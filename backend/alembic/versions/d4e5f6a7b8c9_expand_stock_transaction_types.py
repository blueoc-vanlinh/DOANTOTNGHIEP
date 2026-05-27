"""expand stock transaction types

Revision ID: d4e5f6a7b8c9
Revises: c1d2e3f4a5b6
Create Date: 2026-05-25 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "c1d2e3f4a5b6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


NEW_TYPES = (
    "'IMPORT', 'EXPORT', 'ADJUST', "
    "'IMPORT_CANCEL', 'EXPORT_CANCEL', "
    "'CUSTOMER_RETURN', 'SUPPLIER_RETURN', "
    "'STOCKTAKE_ADJUST', 'PO_RECEIVE'"
)


def upgrade() -> None:
    op.execute("ALTER TABLE stock_transactions DROP CONSTRAINT IF EXISTS ck_stock_transactions_type")
    op.create_check_constraint(
        "ck_stock_transactions_type",
        "stock_transactions",
        f"type IN ({NEW_TYPES})",
    )


def downgrade() -> None:
    op.execute("ALTER TABLE stock_transactions DROP CONSTRAINT IF EXISTS ck_stock_transactions_type")
    op.create_check_constraint(
        "ck_stock_transactions_type",
        "stock_transactions",
        "type IN ('IMPORT', 'EXPORT', 'ADJUST')",
    )
