from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.api.deps import require_permissions
from app.services.export_service import create_export_order

router = APIRouter()


@router.post("/")
def export_goods(
    data: dict,
    _: object = Depends(require_permissions("create_orders")),
    session: Session = Depends(get_session),
):
    return create_export_order(session, data, user_id=1)
