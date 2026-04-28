from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional

from app.db.session import get_session
from app.services.category_service import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
)

router = APIRouter(tags=["Categories"])

@router.get("/")
def list_categories(
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, le=100),
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    return get_categories(
        session=session,
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{category_id}")
def get_one_category(
    category_id: int,
    session: Session = Depends(get_session),
):
    return get_category(session, category_id)


@router.post("/")
def create_new_category(
    data: dict,
    session: Session = Depends(get_session),
):
    return create_category(session, data)


@router.put("/{category_id}")
def update_one_category(
    category_id: int,
    data: dict,
    session: Session = Depends(get_session),
):
    return update_category(session, category_id, data)


@router.delete("/{category_id}")
def delete_one_category(
    category_id: int,
    session: Session = Depends(get_session),
):
    return delete_category(session, category_id)