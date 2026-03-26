from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.services.dashboard_service import total_inventory, low_stock_products, top_selling_products, import_export_summary, inventory_value

router = APIRouter()


@router.get("/")
def dashboard(session: Session = Depends(get_session)):
    return {
        "total_inventory": total_inventory(session),
        "low_stock": low_stock_products(session),
        "top_selling": top_selling_products(session),
        "summary": import_export_summary(session),
        "inventory_value": inventory_value(session)
    }