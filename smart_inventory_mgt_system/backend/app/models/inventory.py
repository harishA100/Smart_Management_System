import enum
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey, String, Text, Enum, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base
from app.models.base import TimestampMixin, utc_now

class TransactionType(str, enum.Enum):
    sale = "sale"
    purchase = "purchase"
    return_ = "return"
    adjustment = "adjustment"
    damaged = "damaged"
    expired = "expired"
    manual = "manual"

class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), unique=True, nullable=False, index=True)
    current_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reserved_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    incoming_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    damaged_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    expired_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
        nullable=False
    )

    product: Mapped["Product"] = relationship("Product", back_populates="inventory")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    transaction_type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True) # e.g., 'sale', 'purchase_order'
    reference_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )

    product: Mapped["Product"] = relationship("Product", back_populates="inventory_transactions")
    user: Mapped["User"] = relationship("User")
