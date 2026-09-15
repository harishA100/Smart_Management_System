from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Numeric, ForeignKey, Text, Boolean
from typing import List, Optional
from app.database.connection import Base
from app.models.base import TimestampMixin

class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    barcode: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(100), nullable=True)
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="pcs")
    cost_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    selling_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    reorder_level: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    maximum_stock_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    shelf_life_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    category: Mapped["Category"] = relationship("Category", back_populates="products")
    inventory: Mapped[Optional["Inventory"]] = relationship("Inventory", back_populates="product", uselist=False)
    inventory_transactions: Mapped[List["InventoryTransaction"]] = relationship("InventoryTransaction", back_populates="product")
    sale_items: Mapped[List["SaleItem"]] = relationship("SaleItem", back_populates="product")
    supplier_products: Mapped[List["SupplierProduct"]] = relationship("SupplierProduct", back_populates="product")
    purchase_order_items: Mapped[List["PurchaseOrderItem"]] = relationship("PurchaseOrderItem", back_populates="product")
    promotions: Mapped[List["Promotion"]] = relationship("Promotion", back_populates="product")
    forecasts: Mapped[List["Forecast"]] = relationship("Forecast", back_populates="product")
    stock_risks: Mapped[List["StockRisk"]] = relationship("StockRisk", back_populates="product")
    ai_recommendations: Mapped[List["AIRecommendation"]] = relationship("AIRecommendation", back_populates="product")
