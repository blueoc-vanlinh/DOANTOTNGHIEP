from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from app.db.session import get_session
from app.api.deps import require_permissions
from app.services.product_service import get_products, get_product, create_product, update_product, delete_product
from app.services.product_import_service import build_product_import_template, import_products_from_file
from app.schemas.product_schema import ProductCreate

router = APIRouter()


@router.get("/")
def get_all(
    session: Session = Depends(get_session),
    search: str | None = Query(None),
    category_id: int | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
):
    skip = (page - 1) * page_size
    return get_products(
        session=session,
        search=search,
        category_id=category_id,
        skip=skip,
        limit=page_size,
    )


@router.get("/import-template")
def download_import_template(
    _: object = Depends(require_permissions("manage_products")),
):
    content = build_product_import_template()
    return StreamingResponse(
        BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="product-import-template.xlsx"'
        },
    )


@router.post("/import-file")
async def import_file(
    file: UploadFile = File(...),
    _: object = Depends(require_permissions("manage_products")),
    session: Session = Depends(get_session),
):
    file_bytes = await file.read()
    return import_products_from_file(
        session,
        file_bytes=file_bytes,
        filename=file.filename or "products.xlsx",
    )


@router.get("/{product_id}")
def get_one(product_id: int, session: Session = Depends(get_session)):
    product = get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/")
def create(
    data: ProductCreate,
    _: object = Depends(require_permissions("manage_products")),
    session: Session = Depends(get_session),
):
    return create_product(session, data.model_dump())


@router.put("/{product_id}")
def update(
    product_id: int,
    data: ProductCreate,
    _: object = Depends(require_permissions("manage_products")),
    session: Session = Depends(get_session),
):
    product = update_product(session, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}")
def delete(
    product_id: int,
    _: object = Depends(require_permissions("manage_products")),
    session: Session = Depends(get_session),
):
    success = delete_product(session, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product has been soft deleted"}
