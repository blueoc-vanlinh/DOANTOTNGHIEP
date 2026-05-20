from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from app.db.session import get_session
from app.services.momo_service import handle_momo_ipn

router = APIRouter(tags=["MoMo"])


@router.post("/ipn")
async def momo_ipn(request: Request, session: Session = Depends(get_session)):
    payload = await request.json()
    return handle_momo_ipn(session, payload)
