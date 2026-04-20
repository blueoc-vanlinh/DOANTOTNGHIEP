from fastapi import APIRouter
from app.api.v1.endpoints import import_api, export_api, product_api, inventory_api, transaction_api, category_api, supplier_api, warehouse_api, user_api, dashboard_api, auth_api

api_router = APIRouter()
api_router.include_router(dashboard_api.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(import_api.router, prefix="/import", tags=["Import"])
api_router.include_router(export_api.router, prefix="/export", tags=["Export"])
api_router.include_router(product_api.router, prefix="/products", tags=["Products"])
api_router.include_router(inventory_api.router, prefix="/inventory", tags=["Inventory"])
api_router.include_router(transaction_api.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(category_api.router, prefix="/categories", tags=["Categories"])
api_router.include_router(supplier_api.router, prefix="/suppliers", tags=["Suppliers"])
api_router.include_router(warehouse_api.router, prefix="/warehouses", tags=["Warehouses"])
api_router.include_router(user_api.router, prefix="/users", tags=["Users"])
api_router.include_router(auth_api.router, prefix="/auth", tags=["Auth"])