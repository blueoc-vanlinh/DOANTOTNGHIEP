from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.services.import_service import create_import_order
from app.schemas.import_schema import ImportCreate

router = APIRouter()


@router.post("/")
def import_goods(data: ImportCreate, session: Session = Depends(get_session)):
    return create_import_order(session, data.model_dump(), user_id=1)