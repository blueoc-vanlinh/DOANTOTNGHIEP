from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from app.db.session import get_session
from app.api.deps import require_permissions
from app.models.user import User
from app.services.import_service import (
    approve_import_order,
    cancel_import_order,
    complete_import_order,
    create_import_order,
    get_import_order_detail,
    list_import_orders,
)
from app.schemas.import_schema import ImportCreate

router = APIRouter()


@router.get("/")
def get_import_orders(
    _: User = Depends(require_permissions("create_orders")),
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
):
    return list_import_orders(
        session,
        page=page,
        page_size=page_size,
        status=status,
        search=search,
    )


@router.get("/{order_id}")
def get_import_order(
    order_id: int,
    _: User = Depends(require_permissions("create_orders")),
    session: Session = Depends(get_session),
):
    return get_import_order_detail(session, order_id)


@router.post("/")
def import_goods(
    data: ImportCreate,
    current_user: User = Depends(require_permissions("create_orders")),
    session: Session = Depends(get_session),
):
    return create_import_order(session, data.model_dump(), user_id=current_user.id)


@router.post("/{order_id}/approve")
def approve_import(
    order_id: int,
    current_user: User = Depends(require_permissions("approve_imports")),
    session: Session = Depends(get_session),
):
    return approve_import_order(session, order_id, current_user.id)


@router.post("/{order_id}/receive")
def receive_import(
    order_id: int,
    current_user: User = Depends(require_permissions("approve_imports")),
    session: Session = Depends(get_session),
):
    return complete_import_order(session, order_id, current_user.id)


@router.post("/{order_id}/cancel")
def cancel_import(
    order_id: int,
    current_user: User = Depends(require_permissions("approve_imports")),
    session: Session = Depends(get_session),
):
    return cancel_import_order(session, order_id, current_user.id)
