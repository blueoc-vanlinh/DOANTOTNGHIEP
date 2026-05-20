"""expand audit logs

Revision ID: a1b2c3d4e5f6
Revises: 9af8d21c0b62
Create Date: 2026-05-21 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "9af8d21c0b62"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("audit_logs")}

    if "method" not in columns:
        op.add_column("audit_logs", sa.Column("method", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    if "path" not in columns:
        op.add_column("audit_logs", sa.Column("path", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    if "status_code" not in columns:
        op.add_column("audit_logs", sa.Column("status_code", sa.Integer(), nullable=True))
    if "success" not in columns:
        op.add_column(
            "audit_logs",
            sa.Column("success", sa.Boolean(), nullable=False, server_default=sa.true()),
        )
    if "ip_address" not in columns:
        op.add_column("audit_logs", sa.Column("ip_address", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    if "user_agent" not in columns:
        op.add_column("audit_logs", sa.Column("user_agent", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    if "description" not in columns:
        op.add_column("audit_logs", sa.Column("description", sqlmodel.sql.sqltypes.AutoString(), nullable=True))

    op.alter_column("audit_logs", "user_id", existing_type=sa.Integer(), nullable=True)
    op.alter_column("audit_logs", "record_id", existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("audit_logs")}

    if "description" in columns:
        op.drop_column("audit_logs", "description")
    if "user_agent" in columns:
        op.drop_column("audit_logs", "user_agent")
    if "ip_address" in columns:
        op.drop_column("audit_logs", "ip_address")
    if "success" in columns:
        op.drop_column("audit_logs", "success")
    if "status_code" in columns:
        op.drop_column("audit_logs", "status_code")
    if "path" in columns:
        op.drop_column("audit_logs", "path")
    if "method" in columns:
        op.drop_column("audit_logs", "method")

    op.alter_column("audit_logs", "record_id", existing_type=sa.Integer(), nullable=False)
    op.alter_column("audit_logs", "user_id", existing_type=sa.Integer(), nullable=False)
