import enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Numeric, ForeignKey, Boolean, Enum, UniqueConstraint
from typing import List
from app.database.connection import Base
from app.models.base import TimestampMixin



class Supplier(Base, TimestampMixin):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    gst_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    payment_terms: Mapped[str | None] = mapped_column(String(100), nullable=True)
    reliability_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    supplier_products: Mapped[List["SupplierProduct"]] = relationship("SupplierProduct", back_populates="supplier")
    purchase_orders: Mapped[List["PurchaseOrder"]] = relationship("PurchaseOrder", back_populates="supplier")
    ai_recommendations: Mapped[List["AIRecommendation"]] = relationship("AIRecommendation", back_populates="recommended_supplier")

class SupplierProduct(Base, TimestampMixin):
    __tablename__ = "supplier_products"
    __table_args__ = (
        UniqueConstraint("supplier_id", "product_id", name="uq_supplier_product"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    supplier_sku: Mapped[str | None] = mapped_column(String(100), nullable=True)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    minimum_order_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    lead_time_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quality_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    is_preferred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="supplier_products")
    product: Mapped["Product"] = relationship("Product", back_populates="supplier_products")
