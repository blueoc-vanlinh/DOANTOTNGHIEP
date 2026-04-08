from pydantic import BaseModel
from typing import List
from datetime import date


class DashboardSummary(BaseModel):
    total_products: int
    total_inventory: int        
    total_imports: int        
    total_exports: int       
    low_stock_items: int 


class ChartDataPoint(BaseModel):
    date: date
    import_qty: int = 0
    export_qty: int = 0


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    chart_data: List[ChartDataPoint]