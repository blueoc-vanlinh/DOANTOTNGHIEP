from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.session import get_session
from app.api.deps import require_roles

from app.schemas.user_schema import (
    UserCreate,
    UserUpdate,
)

from app.services.user_service import (
    get_users,
    get_user,
    create_user,
    update_user,
    delete_user,
    toggle_user_status,
)

router = APIRouter( tags=["Users"])
admin_required = Depends(require_roles("Admin"))

@router.get("/")
def list_users(
    _: object = admin_required,
    session: Session = Depends(get_session),

    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),

    search: Optional[str] = None,

    is_active: Optional[bool] = None,

    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    return get_users(
        session=session,

        page=page,
        page_size=page_size,

        search=search,

        is_active=is_active,

        sort_by=sort_by,
        sort_order=sort_order,
    )

@router.get("/{user_id}")
def get_one_user(
    user_id: int,
    _: object = admin_required,
    session: Session = Depends(get_session),
):
    return get_user(
        session=session,
        user_id=user_id,
    )

@router.post("/")
def create_new_user(
    data: UserCreate,
    _: object = admin_required,
    session: Session = Depends(get_session),
):
    return create_user(
        session=session,
        data=data.model_dump(),
    )

@router.put("/{user_id}")
def update_one_user(
    user_id: int,
    data: UserUpdate,
    _: object = admin_required,
    session: Session = Depends(get_session),
):
    return update_user(
        session=session,
        user_id=user_id,
        data=data.model_dump(exclude_unset=True),
    )

@router.patch("/{user_id}/toggle-status")
def toggle_status(
    user_id: int,
    _: object = admin_required,
    session: Session = Depends(get_session),
):
    return toggle_user_status(
        session=session,
        user_id=user_id,
    )

@router.delete("/{user_id}")
def delete_one_user(
    user_id: int,
    _: object = admin_required,
    session: Session = Depends(get_session),
):
    return delete_user(
        session=session,
        user_id=user_id,
    )
