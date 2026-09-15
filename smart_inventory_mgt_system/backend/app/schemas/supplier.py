from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

# --- Supplier Schemas ---

class SupplierBase(BaseModel):
    name: str = Field(..., max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=20)
    gst_number: Optional[str] = Field(None, max_length=50)
    payment_terms: Optional[str] = Field(None, max_length=100)
    is_active: bool = True

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=20)
    gst_number: Optional[str] = Field(None, max_length=50)
    payment_terms: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class SupplierResponse(SupplierBase):
    id: int
    reliability_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SupplierListResponse(BaseModel):
    items: List[SupplierResponse]
    total: int
    page: int
    page_size: int

# --- Supplier Product Schemas ---

class SupplierProductBase(BaseModel):
    unit_price: float = Field(..., gt=0)
    minimum_order_quantity: int = Field(1, ge=1)
    lead_time_days: Optional[int] = Field(None, ge=0)
    quality_score: Optional[float] = Field(None, ge=0, le=5)
    is_preferred: bool = False

class SupplierProductCreate(SupplierProductBase):
    product_id: int

class SupplierProductUpdate(BaseModel):
    unit_price: Optional[float] = Field(None, gt=0)
    minimum_order_quantity: Optional[int] = Field(None, ge=1)
    lead_time_days: Optional[int] = Field(None, ge=0)
    quality_score: Optional[float] = Field(None, ge=0, le=5)
    is_preferred: Optional[bool] = None

class SupplierProductResponse(SupplierProductBase):
    id: int
    supplier_id: int
    product_id: int
    product_name: str
    product_sku: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Supplier Performance Schemas ---

class SupplierPerformanceResponse(BaseModel):
    total_purchase_orders: int
    completed_purchase_orders: int
    cancelled_orders: int
    average_delivery_time_days: float
    average_quality_score: float
    total_purchase_value: float
    on_time_delivery_percentage: float

# --- Supplier Comparison Schemas ---

class SupplierComparisonItem(BaseModel):
    supplier_id: int
    supplier_name: str
    unit_price: float
    minimum_order_quantity: int
    lead_time_days: Optional[int]
    quality_score: Optional[float]
    is_preferred: bool
    performance: SupplierPerformanceResponse

class SupplierComparisonResponse(BaseModel):
    product_id: int
    suppliers: List[SupplierComparisonItem]
