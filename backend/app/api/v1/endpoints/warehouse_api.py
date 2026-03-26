from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.session import get_session
from app.services.warehouse_service import get_warehouses, get_warehouse, create_warehouse, update_warehouse, delete_warehouse

router = APIRouter()


@router.get("/")
def get_all(session: Session = Depends(get_session)):
    return get_warehouses(session)


@router.get("/{warehouse_id}")
def get_one(warehouse_id: int, session: Session = Depends(get_session)):
    warehouse = get_warehouse(session, warehouse_id)
    if not warehouse:
        raise HTTPException(404, "Warehouse not found")
    return warehouse


@router.post("/")
def create(data: dict, session: Session = Depends(get_session)):
    return create_warehouse(session, data)


@router.put("/{warehouse_id}")
def update(warehouse_id: int, data: dict, session: Session = Depends(get_session)):
    warehouse = update_warehouse(session, warehouse_id, data)
    if not warehouse:
        raise HTTPException(404, "Warehouse not found")
    return warehouse


@router.delete("/{warehouse_id}")
def delete(warehouse_id: int, session: Session = Depends(get_session)):
    ok = delete_warehouse(session, warehouse_id)
    if not ok:
        raise HTTPException(404, "Warehouse not found")
    return {"message": "Deleted"}