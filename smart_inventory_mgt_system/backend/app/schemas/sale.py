from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.models.sales import PaymentMethod, SalesChannel

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    # The client can pass a discount per item if they want, but typically it defaults to 0
    discount: float = Field(default=0.0, ge=0.0)

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    items: List[SaleItemCreate] = Field(..., min_length=1)
    discount: float = Field(default=0.0, ge=0.0)
    tax: float = Field(default=0.0, ge=0.0)
    payment_method: PaymentMethod
    sales_channel: SalesChannel = SalesChannel.store

class CustomerResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    
    model_config = ConfigDict(from_attributes=True)

class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    discount: float
    total_price: float
    
    model_config = ConfigDict(from_attributes=True)

class SaleResponse(BaseModel):
    id: int
    customer_id: Optional[int]
    invoice_number: str
    subtotal: float
    discount: float
    tax: float
    total_amount: float
    payment_method: PaymentMethod
    sales_channel: SalesChannel
    created_at: datetime
    
    customer: Optional[CustomerResponse] = None
    sale_items: List[SaleItemResponse]
    
    model_config = ConfigDict(from_attributes=True)

class SaleListResponse(BaseModel):
    items: List[SaleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class SalesSummaryResponse(BaseModel):
    today_sales: float
    total_orders: int
    items_sold: int
    average_order_value: float
    last_7_days_sales: float
    last_30_days_sales: float
    total_revenue: float
