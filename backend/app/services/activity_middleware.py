from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from sqlmodel import Session

from app.core.security import decode_token
from app.db.session import engine
from app.services.auditlog_service import create_audit_log
from app.services.notification_service import create_notification

WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

RESOURCE_LABELS = {
    "products": "sản phẩm",
    "inventory": "tồn kho",
    "categories": "danh mục",
    "suppliers": "nhà cung cấp",
    "warehouses": "kho",
    "import": "nhập kho",
    "export": "xuất kho",
    "invoices": "hóa đơn",
    "roles": "vai trò",
    "users": "nhân viên",
    "ai-data": "dữ liệu AI",
    "warehouse-automation": "tự động kho",
    "momo": "MoMo",
}


async def activity_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    try:
        response = await call_next(request)
    except Exception as exc:
        if request.url.path.startswith("/api/v1"):
            _write_activity(
                request=request,
                status_code=500,
                success=False,
                extra_data={"error": str(exc)},
            )
        raise

    if not request.url.path.startswith("/api/v1"):
        return response

    _write_activity(
        request=request,
        status_code=response.status_code,
        success=200 <= response.status_code < 400,
    )

    return response


def _write_activity(
    request: Request,
    status_code: int,
    success: bool,
    extra_data: dict | None = None,
) -> None:
    with Session(engine) as session:
        user_id = _extract_user_id(request)
        resource = _resource_from_path(request.url.path)
        action = _action_from_method(request.method)
        description = _describe_action(action, resource, success)

        try:
            create_audit_log(
                session=session,
                user_id=user_id,
                action=action,
                table_name=resource,
                record_id=_record_id_from_path(request.url.path),
                method=request.method,
                path=request.url.path,
                status_code=status_code,
                success=success,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                description=description,
                new_data={
                    "query": dict(request.query_params),
                    "status_code": status_code,
                    **(extra_data or {}),
                },
            )
        except Exception:
            session.rollback()

        if _should_create_notification(request, status_code, user_id):
            try:
                create_notification(
                    session=session,
                    user_id=user_id,
                    title="Thao tác thành công",
                    message=description,
                )
            except Exception:
                session.rollback()


def _extract_user_id(request: Request) -> int | None:
    auth_header = request.headers.get("authorization", "")
    token = None
    if auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1]
    token = token or request.cookies.get("access_token")
    if not token:
        return None

    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        return None
    try:
        return int(payload["sub"])
    except (TypeError, ValueError):
        return None


def _resource_from_path(path: str) -> str:
    parts = [part for part in path.split("/") if part]
    if len(parts) >= 3:
        return parts[2]
    return "system"


def _record_id_from_path(path: str) -> int | None:
    for part in reversed([part for part in path.split("/") if part]):
        if part.isdigit():
            return int(part)
    return None


def _action_from_method(method: str) -> str:
    return {
        "GET": "VIEW",
        "POST": "CREATE",
        "PUT": "UPDATE",
        "PATCH": "UPDATE",
        "DELETE": "DELETE",
    }.get(method.upper(), method.upper())


def _describe_action(action: str, resource: str, success: bool) -> str:
    action_label = {
        "VIEW": "Xem",
        "CREATE": "Tạo",
        "UPDATE": "Cập nhật",
        "DELETE": "Xóa",
    }.get(action, action)
    resource_label = RESOURCE_LABELS.get(resource, resource)
    result = "thành công" if success else "thất bại"
    return f"{action_label} {resource_label} {result}"


def _should_create_notification(
    request: Request,
    status_code: int,
    user_id: int | None,
) -> bool:
    if user_id is None:
        return False
    if request.method.upper() not in WRITE_METHODS:
        return False
    if not 200 <= status_code < 400:
        return False
    excluded_prefixes = (
        "/api/v1/auth",
        "/api/v1/notifications",
        "/api/v1/audit-logs",
    )
    return not request.url.path.startswith(excluded_prefixes)
