from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.session import get_session
from app.services.dashboard_service import (
    get_dashboard_summary,
    get_chart_data,
    get_top_selling_products,
    get_low_stock_products,
)

router = APIRouter()


@router.get("/")
def get_dashboard(
    session: Session = Depends(get_session),
    days: int = Query(30, ge=7, le=90, description="Số ngày hiển thị trên biểu đồ")
):
    """Lấy dữ liệu tổng quan Dashboard"""
    summary = get_dashboard_summary(session)
    chart_data = get_chart_data(session, days=days)

    return {
        "summary": summary,
        "chart_data": chart_data
    }


@router.get("/top-selling")
def get_top_selling(
    session: Session = Depends(get_session),
    limit: int = Query(5, ge=1, le=10)
):
    """Top sản phẩm bán chạy nhất"""
    return get_top_selling_products(session, limit=limit)


@router.get("/low-stock")
def get_low_stock(
    session: Session = Depends(get_session),
    limit: int = Query(10, ge=1, le=50)
):
    """Danh sách sản phẩm tồn kho thấp"""
    return get_low_stock_products(session, limit=limit)


@router.get("/stats")
def get_basic_stats(session: Session = Depends(get_session)):
    """Thống kê cơ bản"""
    summary = get_dashboard_summary(session)
    return {
        "total_products": summary.total_products,
        "total_inventory": summary.total_inventory,
        "total_imports": summary.total_imports,
        "total_exports": summary.total_exports,
        "low_stock_items": summary.low_stock_items,
    }