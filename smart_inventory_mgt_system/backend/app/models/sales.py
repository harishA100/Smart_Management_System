import enum
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Numeric, ForeignKey, Enum, DateTime
from sqlalchemy.sql import func
from typing import List, Optional
from app.database.connection import Base
from app.models.base import TimestampMixin, utc_now

class PaymentMethod(str, enum.Enum):
    cash = "cash"
    card = "card"
    upi = "UPI"
    other = "other"

class SalesChannel(str, enum.Enum):
    store = "store"
    website = "website"

class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )

    sales: Mapped[List["Sale"]] = relationship("Sale", back_populates="customer")

class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id"), nullable=True, index=True)
    invoice_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    tax: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod), nullable=False)
    sales_channel: Mapped[SalesChannel] = mapped_column(Enum(SalesChannel), nullable=False, default=SalesChannel.store)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False, index=True
    )

    customer: Mapped[Optional["Customer"]] = relationship("Customer", back_populates="sales")
    sale_items: Mapped[List["SaleItem"]] = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id"), nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    total_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    sale: Mapped["Sale"] = relationship("Sale", back_populates="sale_items")
    product: Mapped["Product"] = relationship("Product", back_populates="sale_items")
