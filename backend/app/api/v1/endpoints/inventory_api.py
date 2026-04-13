# app/api/v1/endpoints/inventory_api.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import Optional

from app.db.session import get_session
from app.services.inventory_service import (
    get_inventories,
    get_inventory_with_details,
    increase_stock,
    decrease_stock,
    adjust_stock,
)
from app.models.inventory import Inventory   

router = APIRouter(tags=["Inventory"])


@router.get("/")
def get_all_inventory(
    session: Session = Depends(get_session),
    product_id: Optional[int] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    skip = (page - 1) * pageSize
    return get_inventories(
        session=session,
        product_id=product_id,
        warehouse_id=warehouse_id,
        search=search,
        skip=skip,
        limit=pageSize,
    )


@router.get("/{product_id}/{warehouse_id}")
def get_inventory_detail(
    product_id: int,
    warehouse_id: int,
    session: Session = Depends(get_session)
):
    """Lấy chi tiết tồn kho của 1 sản phẩm trong 1 kho"""
    result = get_inventory_with_details(session, product_id, warehouse_id)
    if not result:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return result


@router.post("/increase")
def increase_inventory(
    product_id: int,
    warehouse_id: int,
    quantity: int,
    session: Session = Depends(get_session)
):
    """Tăng tồn kho"""
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    try:
        inventory = increase_stock(session, product_id, warehouse_id, quantity)
        return inventory
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/decrease")
def decrease_inventory(
    product_id: int,
    warehouse_id: int,
    quantity: int,
    session: Session = Depends(get_session)
):
    """Giảm tồn kho"""
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    try:
        inventory = decrease_stock(session, product_id, warehouse_id, quantity)
        return inventory
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/adjust")
def adjust_inventory(
    product_id: int,
    warehouse_id: int,
    quantity: int,
    session: Session = Depends(get_session)
):
    """Điều chỉnh tồn kho"""
    if quantity < 0:
        raise HTTPException(status_code=400, detail="Quantity cannot be negative")

    try:
        inventory = adjust_stock(session, product_id, warehouse_id, quantity)
        return inventory
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{inventory_id}")
def soft_delete_inventory(inventory_id: int, session: Session = Depends(get_session)):
    """Xóa mềm tồn kho"""
    inventory = session.get(Inventory, inventory_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")

    if getattr(inventory, 'is_deleted', False):
        raise HTTPException(status_code=400, detail="Inventory already deleted")

    inventory.is_deleted = True
    session.commit()

    return {"message": "Inventory has been soft deleted"}