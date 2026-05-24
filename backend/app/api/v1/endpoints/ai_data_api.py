from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.session import get_session
from app.api.deps import require_roles
from app.schemas.ai_data_schema import ExternalFactorCreate
from app.services.ai_data_service import (
    create_external_factor,
    get_ai_data_overview,
    get_deep_learning_dataset,
    get_product_training_quality,
    list_external_factors,
)
from app.services.ai_model_evaluation_service import get_public_model_benchmarks

router = APIRouter(tags=["AI Data"])
admin_required = Depends(require_roles("Admin"))


@router.get("/overview")
def ai_data_overview(_: object = admin_required, session: Session = Depends(get_session)):
    return get_ai_data_overview(session)


@router.get("/model-benchmarks")
def ai_model_benchmarks(_: object = admin_required):
    return get_public_model_benchmarks()


@router.get("/public/model-benchmarks")
def public_ai_model_benchmarks():
    return get_public_model_benchmarks()


@router.get("/products/{product_id}/quality")
def product_training_quality(product_id: int, _: object = admin_required, session: Session = Depends(get_session)):
    return get_product_training_quality(session, product_id)


@router.get("/products/{product_id}/deep-learning-dataset")
def product_deep_learning_dataset(product_id: int, _: object = admin_required, session: Session = Depends(get_session)):
    return get_deep_learning_dataset(session, product_id)


@router.get("/external-factors")
def external_factors(
    session: Session = Depends(get_session),
    _: object = admin_required,
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
):
    skip = (page - 1) * page_size
    return list_external_factors(session, skip=skip, limit=page_size)


@router.post("/external-factors")
def add_external_factor(
    data: ExternalFactorCreate,
    _: object = admin_required,
    session: Session = Depends(get_session),
):
    return create_external_factor(session, data.model_dump())
