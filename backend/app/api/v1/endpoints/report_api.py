import csv
from io import StringIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from app.api.deps import require_permissions
from app.db.session import get_session
from app.models.exportorder import ExportOrder
from app.models.importorder import ImportOrder
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.warehouse import Warehouse

router = APIRouter(tags=["Reports"])


def _csv_response(filename: str, headers: list[str], rows: list[list]):
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)
    writer.writerows(rows)
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/inventory.csv")
def inventory_report(_: object = Depends(require_permissions("view_reports")), session: Session = Depends(get_session)):
    rows = session.exec(
        select(Inventory, Product.name, Warehouse.name)
        .join(Product, Product.id == Inventory.product_id)
        .join(Warehouse, Warehouse.id == Inventory.warehouse_id)
        .where(Inventory.is_deleted.is_(False))
    ).all()
    return _csv_response(
        "inventory.csv",
        ["inventory_id", "product", "warehouse", "quantity", "reserved", "oncoming", "min_threshold"],
        [
            [item.id, product_name, warehouse_name, item.quantity, item.reserved_quantity, item.oncoming_quantity, item.min_threshold]
            for item, product_name, warehouse_name in rows
        ],
    )


@router.get("/import-export.csv")
def import_export_report(_: object = Depends(require_permissions("view_reports")), session: Session = Depends(get_session)):
    imports = session.exec(select(ImportOrder).where(ImportOrder.is_deleted.is_(False))).all()
    exports = session.exec(select(ExportOrder).where(ExportOrder.is_deleted.is_(False))).all()
    rows = [
        ["IMPORT", item.id, item.order_code, item.status, item.total_amount, item.tax_amount, item.grand_total, item.created_at]
        for item in imports
    ]
    rows.extend(
        ["EXPORT", item.id, item.order_code, item.status, item.total_amount, item.tax_amount, item.grand_total, item.created_at]
        for item in exports
    )
    return _csv_response(
        "import-export.csv",
        ["type", "id", "code", "status", "subtotal", "tax", "grand_total", "created_at"],
        rows,
    )
