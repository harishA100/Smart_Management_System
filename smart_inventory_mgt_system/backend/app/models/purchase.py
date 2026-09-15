import enum
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Numeric, ForeignKey, Text, Enum, DateTime, Date
from sqlalchemy.sql import func
from typing import List, Optional
from app.database.connection import Base
from app.models.base import TimestampMixin

class POStatus(str, enum.Enum):
    draft = "draft"
    pending_approval = "pending_approval"
    approved = "approved"
    rejected = "rejected"
    ordered = "ordered"
    partially_delivered = "partially_delivered"
    delivered = "delivered"
    cancelled = "cancelled"

class PurchaseOrder(Base, TimestampMixin):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    po_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False, index=True)
    status: Mapped[POStatus] = mapped_column(Enum(POStatus), nullable=False, default=POStatus.draft)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    tax: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    expected_delivery_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="purchase_orders")
    purchase_order_items: Mapped[List["PurchaseOrderItem"]] = relationship("PurchaseOrderItem", back_populates="purchase_order")
    creator: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by])
    approver: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by])

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    purchase_order_id: Mapped[int] = mapped_column(ForeignKey("purchase_orders.id"), nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    total_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    received_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    purchase_order: Mapped["PurchaseOrder"] = relationship("PurchaseOrder", back_populates="purchase_order_items")
    product: Mapped["Product"] = relationship("Product", back_populates="purchase_order_items")
