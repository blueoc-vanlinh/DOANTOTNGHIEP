from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.session import get_session
from app.services.supplier_service import get_suppliers, get_supplier, create_supplier, update_supplier, delete_supplier

router = APIRouter()


@router.get("/")
def get_all(session: Session = Depends(get_session)):
    return get_suppliers(session)


@router.get("/{supplier_id}")
def get_one(supplier_id: int, session: Session = Depends(get_session)):
    supplier = get_supplier(session, supplier_id)
    if not supplier:
        raise HTTPException(404, "Supplier not found")
    return supplier


@router.post("/")
def create(data: dict, session: Session = Depends(get_session)):
    return create_supplier(session, data)


@router.put("/{supplier_id}")
def update(supplier_id: int, data: dict, session: Session = Depends(get_session)):
    supplier = update_supplier(session, supplier_id, data)
    if not supplier:
        raise HTTPException(404, "Supplier not found")
    return supplier


@router.delete("/{supplier_id}")
def delete(supplier_id: int, session: Session = Depends(get_session)):
    ok = delete_supplier(session, supplier_id)
    if not ok:
        raise HTTPException(404, "Supplier not found")
    return {"message": "Deleted"}