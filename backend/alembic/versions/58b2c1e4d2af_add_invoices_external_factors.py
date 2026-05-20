"""add invoices and external factors

Revision ID: 58b2c1e4d2af
Revises: cfc37a8186f2
Create Date: 2026-05-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


revision: str = "58b2c1e4d2af"
down_revision: Union[str, Sequence[str], None] = "cfc37a8186f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if not inspector.has_table("external_factors"):
        op.create_table(
            "external_factors",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("factor_date", sa.Date(), nullable=False),
            sa.Column("factor_type", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("value", sa.Float(), nullable=True),
            sa.Column("impact_score", sa.Float(), nullable=False),
            sa.Column("product_id", sa.Integer(), nullable=True),
            sa.Column("warehouse_id", sa.Integer(), nullable=True),
            sa.Column("source", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("note", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
            sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_external_factors_factor_date"), "external_factors", ["factor_date"])
        op.create_index(op.f("ix_external_factors_factor_type"), "external_factors", ["factor_type"])
        op.create_index(op.f("ix_external_factors_is_deleted"), "external_factors", ["is_deleted"])

    if not inspector.has_table("invoices"):
        op.create_table(
            "invoices",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("invoice_number", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("invoice_type", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("order_id", sa.Integer(), nullable=False),
            sa.Column("partner_name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("total_amount", sa.Float(), nullable=False),
            sa.Column("tax_amount", sa.Float(), nullable=False),
            sa.Column("discount_amount", sa.Float(), nullable=False),
            sa.Column("grand_total", sa.Float(), nullable=False),
            sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("issued_at", sa.DateTime(), nullable=False),
            sa.Column("created_by", sa.Integer(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_invoices_invoice_number"), "invoices", ["invoice_number"], unique=True)
        op.create_index(op.f("ix_invoices_invoice_type"), "invoices", ["invoice_type"])
        op.create_index(op.f("ix_invoices_order_id"), "invoices", ["order_id"])
        op.create_index(op.f("ix_invoices_issued_at"), "invoices", ["issued_at"])
        op.create_index(op.f("ix_invoices_is_deleted"), "invoices", ["is_deleted"])

    if not inspector.has_table("invoice_items"):
        op.create_table(
            "invoice_items",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("invoice_id", sa.Integer(), nullable=False),
            sa.Column("product_id", sa.Integer(), nullable=False),
            sa.Column("description", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("quantity", sa.Integer(), nullable=False),
            sa.Column("unit_price", sa.Float(), nullable=False),
            sa.Column("line_total", sa.Float(), nullable=False),
            sa.Column("is_deleted", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(["invoice_id"], ["invoices.id"]),
            sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_invoice_items_is_deleted"), "invoice_items", ["is_deleted"])


def downgrade() -> None:
    op.drop_index(op.f("ix_invoice_items_is_deleted"), table_name="invoice_items")
    op.drop_table("invoice_items")
    op.drop_index(op.f("ix_invoices_is_deleted"), table_name="invoices")
    op.drop_index(op.f("ix_invoices_issued_at"), table_name="invoices")
    op.drop_index(op.f("ix_invoices_order_id"), table_name="invoices")
    op.drop_index(op.f("ix_invoices_invoice_type"), table_name="invoices")
    op.drop_index(op.f("ix_invoices_invoice_number"), table_name="invoices")
    op.drop_table("invoices")
    op.drop_index(op.f("ix_external_factors_is_deleted"), table_name="external_factors")
    op.drop_index(op.f("ix_external_factors_factor_type"), table_name="external_factors")
    op.drop_index(op.f("ix_external_factors_factor_date"), table_name="external_factors")
    op.drop_table("external_factors")
