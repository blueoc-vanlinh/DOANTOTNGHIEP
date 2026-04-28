from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional

from app.db.session import get_session
from app.services.warehouse_service import (
    get_warehouses,
    get_warehouse,
    create_warehouse,
    update_warehouse,
    delete_warehouse,
)

router = APIRouter(tags=["Warehouses"])


@router.get("/")
def list_warehouses(
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, le=100),
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    return get_warehouses(
        session=session,
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{warehouse_id}")
def get_one_warehouse(
    warehouse_id: int,
    session: Session = Depends(get_session),
):
    return get_warehouse(session, warehouse_id)


@router.post("/")
def create_new_warehouse(
    data: dict,
    session: Session = Depends(get_session),
):
    return create_warehouse(session, data)


@router.put("/{warehouse_id}")
def update_one_warehouse(
    warehouse_id: int,
    data: dict,
    session: Session = Depends(get_session),
):
    return update_warehouse(session, warehouse_id, data)


@router.delete("/{warehouse_id}")
def delete_one_warehouse(
    warehouse_id: int,
    session: Session = Depends(get_session),
):
    return delete_warehouse(session, warehouse_id)