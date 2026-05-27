from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from app.db.session import get_session
from app.api.deps import require_permissions
from app.models.user import User
from app.services.export_service import (
    approve_export_order,
    cancel_export_order,
    complete_export_order,
    create_export_order,
    get_export_order_detail,
    list_export_orders,
)

router = APIRouter()


@router.get("/")
def get_export_orders(
    _: User = Depends(require_permissions("create_orders")),
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
):
    return list_export_orders(
        session,
        page=page,
        page_size=page_size,
        status=status,
        search=search,
    )


@router.get("/{order_id}")
def get_export_order(
    order_id: int,
    _: User = Depends(require_permissions("create_orders")),
    session: Session = Depends(get_session),
):
    return get_export_order_detail(session, order_id)


@router.post("/")
def export_goods(
    data: dict,
    current_user: User = Depends(require_permissions("create_orders")),
    session: Session = Depends(get_session),
):
    return create_export_order(session, data, user_id=current_user.id)


@router.post("/{order_id}/approve")
def approve_export(
    order_id: int,
    current_user: User = Depends(require_permissions("approve_exports")),
    session: Session = Depends(get_session),
):
    return approve_export_order(session, order_id, current_user.id)


@router.post("/{order_id}/ship")
def ship_export(
    order_id: int,
    current_user: User = Depends(require_permissions("approve_exports")),
    session: Session = Depends(get_session),
):
    return complete_export_order(session, order_id, current_user.id)


@router.post("/{order_id}/cancel")
def cancel_export(
    order_id: int,
    current_user: User = Depends(require_permissions("approve_exports")),
    session: Session = Depends(get_session),
):
    return cancel_export_order(session, order_id, current_user.id)
