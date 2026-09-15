import enum
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, ForeignKey, Boolean, Enum, DateTime, Date
from sqlalchemy.sql import func
from app.database.connection import Base
from app.models.base import TimestampMixin, utc_now

class PromotionType(str, enum.Enum):
    discount = "discount"
    bundle = "bundle"
    clearance = "clearance"
    seasonal = "seasonal"

class Promotion(Base):
    __tablename__ = "promotions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    promotion_type: Mapped[PromotionType] = mapped_column(Enum(PromotionType), nullable=False)
    discount_percentage: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    start_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    end_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )

    product: Mapped["Product"] = relationship("Product", back_populates="promotions")
