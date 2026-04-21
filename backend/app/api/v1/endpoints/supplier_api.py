from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional

from app.db.session import get_session
from app.services.supplier_service import (
    get_suppliers,
    create_supplier,
    update_supplier,
    delete_suppliers,
)

router = APIRouter(tags=["Suppliers"])

@router.get("/")
def list_suppliers(
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    return get_suppliers(
        session=session,
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{supplier_id}")
def get_one_supplier(
    supplier_id: int,
    session: Session = Depends(get_session),
):
    return get_suppliers(session, supplier_id)


@router.post("/")
def create_new_supplier(
    data: dict,
    session: Session = Depends(get_session),
):
    return create_supplier(session, data)

@router.put("/{supplier_id}")
def update_one_supplier(
    supplier_id: int,
    data: dict,
    session: Session = Depends(get_session),
):
    return update_supplier(session, supplier_id, data)


@router.delete("/{supplier_id}")
def delete_one_supplier(
    supplier_id: int,
    session: Session = Depends(get_session),
):
    return delete_suppliers(session, supplier_id)