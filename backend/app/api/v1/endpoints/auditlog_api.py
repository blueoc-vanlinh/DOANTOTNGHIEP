from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.api.deps import require_permissions
from app.db.session import get_session
from app.schemas.auditlog_schema import AuditLogListResponse
from app.services.auditlog_service import get_audit_logs

router = APIRouter(tags=["Audit Logs"])


@router.get("/", response_model=AuditLogListResponse)
def list_audit_logs(
    search: str | None = Query(None),
    user_id: int | None = Query(None),
    action: str | None = Query(None),
    success: bool | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    _: object = Depends(require_permissions("view_audit_log")),
    session: Session = Depends(get_session),
):
    return get_audit_logs(
        session=session,
        search=search,
        user_id=user_id,
        action=action,
        success=success,
        skip=(page - 1) * page_size,
        limit=page_size,
    )
