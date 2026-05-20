from sqlmodel import Session, func, or_, select
from app.models.auditlog import AuditLog
from app.models.user import User


def create_audit_log(
    session: Session,
    user_id: int | None,
    action: str,
    table_name: str,
    record_id: int | None = None,
    old_data=None,
    new_data=None,
    method: str | None = None,
    path: str | None = None,
    status_code: int | None = None,
    success: bool = True,
    ip_address: str | None = None,
    user_agent: str | None = None,
    description: str | None = None,
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_data=old_data,
        new_data=new_data,
        method=method,
        path=path,
        status_code=status_code,
        success=success,
        ip_address=ip_address,
        user_agent=user_agent,
        description=description,
    )
    session.add(log)
    session.commit()
    return log


def get_audit_logs(
    session: Session,
    search: str | None = None,
    user_id: int | None = None,
    action: str | None = None,
    success: bool | None = None,
    skip: int = 0,
    limit: int = 20,
):
    query = select(AuditLog).where(AuditLog.is_deleted.is_(False))
    count_query = select(func.count()).select_from(AuditLog).where(
        AuditLog.is_deleted.is_(False)
    )

    if search:
        condition = or_(
            AuditLog.action.ilike(f"%{search}%"),
            AuditLog.table_name.ilike(f"%{search}%"),
            AuditLog.path.ilike(f"%{search}%"),
            AuditLog.description.ilike(f"%{search}%"),
        )
        query = query.where(condition)
        count_query = count_query.where(condition)

    if user_id is not None:
        query = query.where(AuditLog.user_id == user_id)
        count_query = count_query.where(AuditLog.user_id == user_id)

    if action:
        query = query.where(AuditLog.action == action)
        count_query = count_query.where(AuditLog.action == action)

    if success is not None:
        query = query.where(AuditLog.success == success)
        count_query = count_query.where(AuditLog.success == success)

    total = session.exec(count_query).one() or 0
    logs = session.exec(
        query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
    ).all()
    user_ids = {log.user_id for log in logs if log.user_id is not None}
    users = {}
    if user_ids:
        users = {
            user.id: user
            for user in session.exec(select(User).where(User.id.in_(user_ids))).all()
        }
    items = []
    for log in logs:
        user = users.get(log.user_id)
        data = log.model_dump()
        data["user_name"] = user.name if user else None
        data["actor"] = f"{user.name} #{user.id}" if user else "Hệ thống"
        items.append(data)

    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "page_size": limit,
    }
