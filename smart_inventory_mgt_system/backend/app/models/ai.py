import enum
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Numeric, ForeignKey, Text, Boolean, Enum, DateTime, Date, JSON
from sqlalchemy.sql import func
from typing import Optional
from app.database.connection import Base
from app.models.base import TimestampMixin, utc_now

class RiskLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class RecommendationType(str, enum.Enum):
    reorder = "reorder"
    no_action = "no_action"
    promotion = "promotion"
    expiry_risk = "expiry_risk"
    supplier_change = "supplier_change"
    reduce_inventory = "reduce_inventory"

class RecommendationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    completed = "completed"
    expired = "expired"

class AgentActionStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    success = "success"
    failed = "failed"

class NotificationSeverity(str, enum.Enum):
    info = "info"
    warning = "warning"
    critical = "critical"
    success = "success"

class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    forecast_date: Mapped[datetime] = mapped_column(Date, nullable=False, index=True)
    predicted_demand: Mapped[int] = mapped_column(Integer, nullable=False)
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )

    product: Mapped["Product"] = relationship("Product", back_populates="forecasts")

class StockRisk(Base):
    __tablename__ = "stock_risks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    risk_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    stockout_probability: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), nullable=False)
    predicted_stockout_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )

    product: Mapped["Product"] = relationship("Product", back_populates="stock_risks")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    recommendation_type: Mapped[RecommendationType] = mapped_column(Enum(RecommendationType), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommended_action: Mapped[str | None] = mapped_column(String(255), nullable=True)
    recommended_quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    recommended_supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"), nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    status: Mapped[RecommendationStatus] = mapped_column(Enum(RecommendationStatus), nullable=False, default=RecommendationStatus.pending)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    product: Mapped["Product"] = relationship("Product", back_populates="ai_recommendations")
    recommended_supplier: Mapped[Optional["Supplier"]] = relationship("Supplier", back_populates="ai_recommendations")

class AgentAction(Base):
    __tablename__ = "agent_actions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    input_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[AgentActionStatus] = mapped_column(Enum(AgentActionStatus), nullable=False, default=AgentActionStatus.success)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    severity: Mapped[NotificationSeverity] = mapped_column(Enum(NotificationSeverity), nullable=False, default=NotificationSeverity.info)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    old_value: Mapped[str | None] = mapped_column(Text, nullable=True) # Usually serialized JSON
    new_value: Mapped[str | None] = mapped_column(Text, nullable=True) # Usually serialized JSON
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )

    user: Mapped[Optional["User"]] = relationship("User")
