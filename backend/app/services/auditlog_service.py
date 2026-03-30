from sqlmodel import Session
from app.models.auditlog import AuditLog


def create_audit_log(
    session: Session,
    user_id: int,
    action: str,
    table_name: str,
    record_id: int,
    old_data=None,
    new_data=None
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_data=old_data,
        new_data=new_data
    )
    session.add(log)
    session.commit()
    return log