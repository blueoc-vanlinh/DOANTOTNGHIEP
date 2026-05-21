from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.api.deps import require_permissions
from app.db.session import get_session
from app.models.user import User
from app.services.warehouse_operations_service import (
    cancel_export_order,
    cancel_import_order,
    complete_stocktake,
    create_inventory_batch,
    create_purchase_order,
    create_return_order,
    create_stocktake,
    create_storage_bin,
    list_inventory_batches,
    list_storage_bins,
    receive_purchase_order,
    update_purchase_order_status,
)

router = APIRouter(tags=["Warehouse Operations"])


@router.get("/bins")
def bins(_: User = Depends(require_permissions("manage_inventory")), session: Session = Depends(get_session)):
    return list_storage_bins(session)


@router.post("/bins")
def add_bin(data: dict, _: User = Depends(require_permissions("manage_inventory")), session: Session = Depends(get_session)):
    return create_storage_bin(session, data)


@router.get("/batches")
def batches(product_id: int | None = None, _: User = Depends(require_permissions("manage_inventory")), session: Session = Depends(get_session)):
    return list_inventory_batches(session, product_id=product_id)


@router.post("/batches")
def add_batch(data: dict, _: User = Depends(require_permissions("manage_inventory")), session: Session = Depends(get_session)):
    return create_inventory_batch(session, data)


@router.post("/returns")
def add_return(data: dict, current_user: User = Depends(require_permissions("create_orders")), session: Session = Depends(get_session)):
    return create_return_order(session, data, current_user.id)


@router.post("/imports/{order_id}/cancel")
def cancel_import(order_id: int, current_user: User = Depends(require_permissions("approve_imports")), session: Session = Depends(get_session)):
    return cancel_import_order(session, order_id, current_user.id)


@router.post("/exports/{order_id}/cancel")
def cancel_export(order_id: int, current_user: User = Depends(require_permissions("approve_exports")), session: Session = Depends(get_session)):
    return cancel_export_order(session, order_id, current_user.id)


@router.post("/stocktakes")
def add_stocktake(data: dict, current_user: User = Depends(require_permissions("manage_inventory")), session: Session = Depends(get_session)):
    return create_stocktake(session, data, current_user.id)


@router.post("/stocktakes/{stocktake_id}/complete")
def finish_stocktake(stocktake_id: int, current_user: User = Depends(require_permissions("manage_inventory")), session: Session = Depends(get_session)):
    return complete_stocktake(session, stocktake_id, current_user.id)


@router.post("/purchase-orders")
def add_purchase_order(data: dict, current_user: User = Depends(require_permissions("create_orders")), session: Session = Depends(get_session)):
    return create_purchase_order(session, data, current_user.id)


@router.patch("/purchase-orders/{po_id}/status")
def set_po_status(po_id: int, status: str, current_user: User = Depends(require_permissions("approve_imports")), session: Session = Depends(get_session)):
    return update_purchase_order_status(session, po_id, status, current_user.id)


@router.post("/purchase-orders/{po_id}/receive")
def receive_po(po_id: int, current_user: User = Depends(require_permissions("approve_imports")), session: Session = Depends(get_session)):
    return receive_purchase_order(session, po_id, current_user.id)
