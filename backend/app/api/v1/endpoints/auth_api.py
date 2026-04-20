from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.schemas.auth_schema import LoginRequest, LoginResponse
from app.services.auth_service import login_service

router = APIRouter( tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, session: Session = Depends(get_session)):
    return login_service(session, data.email, data.password)