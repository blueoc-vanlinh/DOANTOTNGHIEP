from typing import Optional
from sqlmodel import Session, select
from sqlalchemy import or_, func, desc
from fastapi import HTTPException

from app.models.user import User
from app.models.auth import Role
from app.core.security import hash_password

def get_users(
    session: Session,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    query = select(User).where(~User.is_deleted)

    # 🔍 SEARCH
    if search:
        query = query.where(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )
    if is_active is not None:
        query = query.where(User.status == ("ACTIVE" if is_active else "INACTIVE"))
    allowed_sort_fields = [
        "id",
        "name",
        "email",
        "created_at",
    ]

    if sort_by not in allowed_sort_fields:
        sort_by = "created_at"

    column = getattr(User, sort_by)

    query = query.order_by(
        desc(column) if sort_order == "desc" else column.asc()
    )
    count_query = select(func.count()).select_from(User).where(
        ~User.is_deleted
    )

    if search:
        count_query = count_query.where(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )

    if is_active is not None:
        count_query = count_query.where(User.status == ("ACTIVE" if is_active else "INACTIVE"))

    total = session.exec(count_query).one()
    offset = (page - 1) * page_size

    users = session.exec(
        query.offset(offset).limit(page_size)
    ).all()
    role_ids = [user.role_id for user in users if user.role_id]
    roles = session.exec(select(Role).where(Role.id.in_(role_ids))).all() if role_ids else []
    role_map = {role.id: role.name for role in roles}

    return {
        "items": [
            {
                **user.model_dump(),
                "role_name": role_map.get(user.role_id),
            }
            for user in users
        ],
        "meta": {
            "total": total,
            "page": page,
            "page_size": page_size,
        },
    }
def get_user(
    session: Session,
    user_id: int,
):
    user = session.get(User, user_id)

    if not user or user.is_deleted:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user
def create_user(
    session: Session,
    data: dict,
):
    existing_email = session.exec(
        select(User).where(
            User.email == data["email"],
            ~User.is_deleted,
        )
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )
    data["password"] = hash_password(data["password"])

    user = User(**data)

    session.add(user)
    session.commit()
    session.refresh(user)

    return user
def update_user(
    session: Session,
    user_id: int,
    data: dict,
):
    user = session.get(User, user_id)

    if not user or user.is_deleted:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    if data.get("email"):
        existing_email = session.exec(
            select(User).where(
                User.email == data["email"],
                User.id != user_id,
                ~User.is_deleted,
            )
        ).first()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists",
            )
    if data.get("password"):
        data["password"] = hash_password(data["password"])

    # 🔄 UPDATE
    for key, value in data.items():
        if value is not None:
            setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)

    return user
def toggle_user_status(
    session: Session,
    user_id: int,
):
    user = session.get(User, user_id)

    if not user or user.is_deleted:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.status = (
        "INACTIVE"
        if user.status == "ACTIVE"
        else "ACTIVE"
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "message": "Status updated successfully",
        "status": user.status,
    }
def delete_user(
    session: Session,
    user_id: int,
):
    user = session.get(User, user_id)

    if not user or user.is_deleted:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.is_deleted = True

    session.add(user)
    session.commit()

    return {
        "message": "User deleted successfully",
    }
