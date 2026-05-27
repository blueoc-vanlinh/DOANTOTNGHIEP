from datetime import datetime

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.exportorder import ExportOrder, ExportOrderItem
from app.models.importorder import ImportOrder, ImportOrderItem
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.transaction import StockTransaction
from app.models.warehouse_operations import (
    InventoryBatch,
    PurchaseOrder,
    PurchaseOrderItem,
    ReturnOrder,
    ReturnOrderItem,
    Stocktake,
    StocktakeItem,
    StorageBin,
)
from app.services.inventory_service import get_inventory


def _code(prefix: str) -> str:
    return f"{prefix}{datetime.now().strftime('%H%M%d%m%Y%S')}"


def list_storage_bins(session: Session):
    return session.exec(
        select(StorageBin)
        .where(StorageBin.is_deleted.is_(False))
        .order_by(StorageBin.created_at.desc())
    ).all()


def create_storage_bin(session: Session, data: dict):
    storage_bin = StorageBin(**data)
    session.add(storage_bin)
    session.commit()
    session.refresh(storage_bin)
    return storage_bin


def list_inventory_batches(session: Session, product_id: int | None = None):
    query = select(InventoryBatch).where(InventoryBatch.is_deleted.is_(False))
    if product_id is not None:
        query = query.where(InventoryBatch.product_id == product_id)
    return session.exec(query.order_by(InventoryBatch.created_at.desc())).all()


def create_inventory_batch(session: Session, data: dict):
    batch = InventoryBatch(**data)
    session.add(batch)
    session.commit()
    session.refresh(batch)
    return batch


def create_return_order(session: Session, data: dict, user_id: int):
    return_type = data["return_type"]
    if return_type not in {"CUSTOMER_RETURN", "SUPPLIER_RETURN"}:
        raise HTTPException(status_code=400, detail="Invalid return_type")

    order = ReturnOrder(
        return_code=_code("RT"),
        return_type=return_type,
        related_order_type=data.get("related_order_type"),
        related_order_id=data.get("related_order_id"),
        customer_name=data.get("customer_name"),
        supplier_id=data.get("supplier_id"),
        reason=data.get("reason"),
        status="COMPLETED",
        created_by=user_id,
    )
    session.add(order)
    session.flush()

    total = 0.0
    for item in data.get("items", []):
        product = session.get(Product, item["product_id"])
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        inventory = get_inventory(session, item["product_id"], item["warehouse_id"])
        if not inventory:
            inventory = Inventory(
                product_id=item["product_id"],
                warehouse_id=item["warehouse_id"],
                quantity=0,
            )
            session.add(inventory)
            session.flush()

        quantity = int(item["quantity"])
        unit_price = float(item.get("unit_price") or product.price or 0)
        if return_type == "CUSTOMER_RETURN":
            inventory.quantity += quantity
            transaction_type = "CUSTOMER_RETURN"
        else:
            if inventory.quantity < quantity:
                raise HTTPException(status_code=400, detail="Not enough stock for supplier return")
            inventory.quantity -= quantity
            transaction_type = "SUPPLIER_RETURN"

        session.add(
            ReturnOrderItem(
                return_order_id=order.id,
                product_id=item["product_id"],
                warehouse_id=item["warehouse_id"],
                quantity=quantity,
                unit_price=unit_price,
            )
        )
        session.add(
            StockTransaction(
                product_id=item["product_id"],
                warehouse_id=item["warehouse_id"],
                type=transaction_type,
                quantity=quantity,
                balance_after=inventory.quantity,
                reference_type="RETURN_ORDER",
                reference_id=order.id,
                created_by=user_id,
            )
        )
        total += quantity * unit_price

    order.total_amount = total
    session.commit()
    session.refresh(order)
    return order


def cancel_import_order(session: Session, order_id: int, user_id: int):
    from app.services.import_service import cancel_import_order as cancel_order

    return cancel_order(session, order_id, user_id)


def cancel_export_order(session: Session, order_id: int, user_id: int):
    from app.services.export_service import cancel_export_order as cancel_order

    return cancel_order(session, order_id, user_id)


def create_stocktake(session: Session, data: dict, user_id: int):
    stocktake = Stocktake(
        stocktake_code=_code("ST"),
        warehouse_id=data.get("warehouse_id"),
        status="DRAFT",
        note=data.get("note"),
        created_by=user_id,
    )
    session.add(stocktake)
    session.flush()
    for item in data.get("items", []):
        inventory = get_inventory(session, item["product_id"], item["warehouse_id"])
        system_quantity = inventory.quantity if inventory else 0
        counted_quantity = int(item["counted_quantity"])
        session.add(
            StocktakeItem(
                stocktake_id=stocktake.id,
                product_id=item["product_id"],
                warehouse_id=item["warehouse_id"],
                system_quantity=system_quantity,
                counted_quantity=counted_quantity,
                difference_quantity=counted_quantity - system_quantity,
                note=item.get("note"),
            )
        )
    session.commit()
    session.refresh(stocktake)
    return stocktake


def complete_stocktake(session: Session, stocktake_id: int, user_id: int):
    stocktake = session.get(Stocktake, stocktake_id)
    if not stocktake or stocktake.is_deleted:
        raise HTTPException(status_code=404, detail="Stocktake not found")
    if stocktake.status == "COMPLETED":
        return stocktake
    items = session.exec(select(StocktakeItem).where(StocktakeItem.stocktake_id == stocktake_id)).all()
    for item in items:
        inventory = get_inventory(session, item.product_id, item.warehouse_id)
        if not inventory:
            inventory = Inventory(product_id=item.product_id, warehouse_id=item.warehouse_id, quantity=0)
        inventory.quantity = item.counted_quantity
        session.add(inventory)
        session.add(
            StockTransaction(
                product_id=item.product_id,
                warehouse_id=item.warehouse_id,
                type="STOCKTAKE_ADJUST",
                quantity=abs(item.difference_quantity),
                balance_after=inventory.quantity,
                reference_type="STOCKTAKE",
                reference_id=stocktake.id,
                created_by=user_id,
            )
        )
    stocktake.status = "COMPLETED"
    stocktake.approved_by = user_id
    session.commit()
    session.refresh(stocktake)
    return stocktake


def create_purchase_order(session: Session, data: dict, user_id: int):
    po = PurchaseOrder(
        po_code=_code("PO"),
        supplier_id=data["supplier_id"],
        status=data.get("status", "DRAFT"),
        note=data.get("note"),
        created_by=user_id,
    )
    session.add(po)
    session.flush()
    total = 0.0
    for item in data.get("items", []):
        quantity = int(item["quantity"])
        unit_cost = float(item["unit_cost"])
        session.add(
            PurchaseOrderItem(
                purchase_order_id=po.id,
                product_id=item["product_id"],
                warehouse_id=item["warehouse_id"],
                quantity=quantity,
                unit_cost=unit_cost,
            )
        )
        total += quantity * unit_cost
    po.total_amount = total
    session.commit()
    session.refresh(po)
    return po


def update_purchase_order_status(session: Session, po_id: int, status: str, user_id: int):
    po = session.get(PurchaseOrder, po_id)
    if not po or po.is_deleted:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    if status not in {"DRAFT", "APPROVED", "RECEIVED", "CANCELLED"}:
        raise HTTPException(status_code=400, detail="Invalid purchase order status")
    po.status = status
    if status == "APPROVED":
        po.approved_by = user_id
    session.commit()
    session.refresh(po)
    return po


def receive_purchase_order(session: Session, po_id: int, user_id: int):
    po = session.get(PurchaseOrder, po_id)
    if not po or po.is_deleted:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    if po.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Cannot receive cancelled PO")
    items = session.exec(select(PurchaseOrderItem).where(PurchaseOrderItem.purchase_order_id == po_id)).all()
    for item in items:
        inventory = get_inventory(session, item.product_id, item.warehouse_id)
        if not inventory:
            inventory = Inventory(product_id=item.product_id, warehouse_id=item.warehouse_id, quantity=0)
        inventory.quantity += item.quantity
        item.received_quantity = item.quantity
        session.add(inventory)
        session.add(item)
        session.add(
            StockTransaction(
                product_id=item.product_id,
                warehouse_id=item.warehouse_id,
                type="PO_RECEIVE",
                quantity=item.quantity,
                balance_after=inventory.quantity,
                reference_type="PURCHASE_ORDER",
                reference_id=po.id,
                created_by=user_id,
            )
        )
    po.status = "RECEIVED"
    session.commit()
    session.refresh(po)
    return po
