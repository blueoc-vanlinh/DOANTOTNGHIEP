from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.session import get_session
from app.services.user_service import get_users, get_user, create_user, update_user, delete_user

router = APIRouter()


@router.get("/")
def get_all(session: Session = Depends(get_session)):
    return get_users(session)


@router.get("/{user_id}")
def get_one(user_id: int, session: Session = Depends(get_session)):
    user = get_user(session, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.post("/")
def create(data: dict, session: Session = Depends(get_session)):
    return create_user(session, data)


@router.put("/{user_id}")
def update(user_id: int, data: dict, session: Session = Depends(get_session)):
    user = update_user(session, user_id, data)
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.delete("/{user_id}")
def delete(user_id: int, session: Session = Depends(get_session)):
    ok = delete_user(session, user_id)
    if not ok:
        raise HTTPException(404, "User not found")
    return {"message": "Deleted"}