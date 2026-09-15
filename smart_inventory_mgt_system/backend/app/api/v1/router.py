from fastapi import APIRouter
from app.api.v1 import products, categories, inventory, sales, suppliers, purchase_orders

api_router = APIRouter()

@api_router.get("/health", tags=["system"])
async def health_check():
    return {
        "status": "ok",
        "service": "Supermarket AI API"
    }

api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(purchase_orders.router, prefix="/purchase-orders", tags=["purchase-orders"])

# Future routes will be included here:
# api_router.include_router(products.router, prefix="/products", tags=["products"])
# api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
# api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
# api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
# api_router.include_router(purchase_orders.router, prefix="/purchase-orders", tags=["purchase-orders"])
# api_router.include_router(forecasts.router, prefix="/forecasts", tags=["forecasts"])
# api_router.include_router(ai_insights.router, prefix="/ai-insights", tags=["ai-insights"])
