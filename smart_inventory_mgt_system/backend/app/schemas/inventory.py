from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.schemas.product import ProductResponse
from app.models.inventory import TransactionType

# Requests
class StockReceiveRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity to receive")
    reference_id: Optional[int] = None
    notes: Optional[str] = None

class StockAdjustmentRequest(BaseModel):
    quantity_change: int = Field(..., description="Positive or negative quantity to adjust")
    notes: str = Field(..., min_length=1, description="Notes are required for manual adjustments")

class StockDamageRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity damaged")
    notes: Optional[str] = None

class StockExpiryRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity expired")
    notes: Optional[str] = None

# Responses
class InventoryResponse(BaseModel):
    product: ProductResponse
    current_stock: int
    reserved_stock: int
    incoming_stock: int
    damaged_stock: int
    expired_stock: int
    available_stock: int
    reorder_level: int
    maximum_stock_level: Optional[int]
    stock_status: str
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InventoryListResponse(BaseModel):
    items: List[InventoryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class InventorySummaryResponse(BaseModel):
    total_products: int
    total_units: int
    low_stock_products: int
    out_of_stock_products: int
    inventory_value: float
    incoming_units: int
    damaged_units: int
    expired_units: int

class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    transaction_type: TransactionType
    quantity: int
    reference_type: Optional[str]
    reference_id: Optional[int]
    notes: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InventoryTransactionListResponse(BaseModel):
    items: List[InventoryTransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
