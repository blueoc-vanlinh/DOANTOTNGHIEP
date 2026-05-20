from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.role_schema import RoleCreate, RoleUpdate
from app.services.role_service import (
    create_role,
    delete_role,
    list_permissions,
    list_roles,
    update_role,
)

router = APIRouter(tags=["Roles"])


@router.get("/")
def get_roles(session: Session = Depends(get_session)):
    return list_roles(session)


@router.get("/permissions")
def get_permissions(session: Session = Depends(get_session)):
    return list_permissions(session)


@router.post("/")
def create_new_role(data: RoleCreate, session: Session = Depends(get_session)):
    return create_role(session, data.model_dump())


@router.put("/{role_id}")
def update_one_role(
    role_id: int,
    data: RoleUpdate,
    session: Session = Depends(get_session),
):
    return update_role(session, role_id, data.model_dump(exclude_unset=True))


@router.delete("/{role_id}")
def delete_one_role(role_id: int, session: Session = Depends(get_session)):
    return delete_role(session, role_id)
