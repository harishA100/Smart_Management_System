from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.schemas.category import CategoryResponse

class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: int
    brand: Optional[str] = Field(None, max_length=100)
    unit: str = Field(default="pcs", max_length=50)
    cost_price: float = Field(..., ge=0)
    selling_price: float = Field(..., ge=0)
    reorder_level: int = Field(default=10, ge=0)
    maximum_stock_level: Optional[int] = Field(None, ge=0)
    shelf_life_days: Optional[int] = Field(None, ge=0)
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: Optional[int] = None
    brand: Optional[str] = Field(None, max_length=100)
    unit: Optional[str] = Field(None, max_length=50)
    cost_price: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    reorder_level: Optional[int] = Field(None, ge=0)
    maximum_stock_level: Optional[int] = Field(None, ge=0)
    shelf_life_days: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: CategoryResponse

    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
