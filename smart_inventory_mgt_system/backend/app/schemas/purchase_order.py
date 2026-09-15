from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from typing import List, Optional
from app.models.purchase import POStatus

# --- PO Item Schemas ---

class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class PurchaseOrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    quantity: int
    received_quantity: int
    unit_price: float
    total_price: float

    model_config = ConfigDict(from_attributes=True)

# --- PO Schemas ---

class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    expected_delivery_date: Optional[date] = None
    notes: Optional[str] = None
    items: List[PurchaseOrderItemCreate] = Field(..., min_length=1)

class PurchaseOrderResponse(BaseModel):
    id: int
    po_number: str
    supplier_id: int
    supplier_name: str
    status: POStatus
    subtotal: float
    tax: float
    total_amount: float
    expected_delivery_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[PurchaseOrderItemResponse]

    model_config = ConfigDict(from_attributes=True)

class PurchaseOrderListResponse(BaseModel):
    items: List[PurchaseOrderResponse]
    total: int
    page: int
    page_size: int

# --- Status Change Schemas ---

class RejectionReason(BaseModel):
    rejection_reason: str = Field(..., min_length=1)

class CancellationReason(BaseModel):
    cancellation_reason: str = Field(..., min_length=1)

# --- Receiving Schemas ---

class PurchaseOrderItemReceive(BaseModel):
    product_id: int
    received_quantity: int = Field(..., gt=0)

class PurchaseOrderReceive(BaseModel):
    items: List[PurchaseOrderItemReceive] = Field(..., min_length=1)

# --- Summary Schemas ---

class PurchaseOrderSummaryResponse(BaseModel):
    total_purchase_orders: int
    draft_orders: int
    pending_approval: int
    approved: int
    ordered: int
    partially_delivered: int
    delivered: int
    cancelled: int
    total_purchase_value: float
    pending_purchase_value: float
