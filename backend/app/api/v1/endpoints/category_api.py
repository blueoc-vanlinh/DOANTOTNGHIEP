from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.session import get_session
from app.services.category_service import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category
)

router = APIRouter()


@router.get("/")
def get_all(session: Session = Depends(get_session)):
    return get_categories(session)


@router.get("/{category_id}")
def get_one(category_id: int, session: Session = Depends(get_session)):
    category = get_category(session, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/")
def create(data: dict, session: Session = Depends(get_session)):
    return create_category(session, data)

@router.put("/{category_id}")
def update(category_id: int, data: dict, session: Session = Depends(get_session)):
    category = update_category(session, category_id, data)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.delete("/{category_id}")
def delete(category_id: int, session: Session = Depends(get_session)):
    ok = delete_category(session, category_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Deleted successfully"}