from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.inventory import Inventory
from app.services.inventory_service import get_inventory

router = APIRouter()

@router.get("/")
def get_all_inventory(session: Session = Depends(get_session)):
    return session.exec(select(Inventory)).all()

@router.get("/detail")
def get_inventory_detail(
    product_id: int,
    warehouse_id: int,
    session: Session = Depends(get_session)
):
    inventory = get_inventory(session, product_id, warehouse_id)

    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")

    return inventory
@router.put("/adjust")
def adjust_inventory(
    product_id: int,
    warehouse_id: int,
    quantity: int,
    session: Session = Depends(get_session)
):
    inventory = get_inventory(session, product_id, warehouse_id)

    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")

    inventory.quantity = quantity

    session.commit()
    session.refresh(inventory)

    return inventory
@router.delete("/{inventory_id}")
def delete_inventory(inventory_id: int, session: Session = Depends(get_session)):
    inventory = session.get(Inventory, inventory_id)

    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")

    session.delete(inventory)
    session.commit()

    return {"message": "Deleted"}