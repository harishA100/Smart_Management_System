import enum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, Enum
from app.database.connection import Base
from app.models.base import TimestampMixin

class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    inventory_staff = "inventory_staff"
    procurement_staff = "procurement_staff"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False, default=UserRole.inventory_staff)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
