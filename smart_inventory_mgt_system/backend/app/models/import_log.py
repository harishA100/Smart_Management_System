import enum
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Enum, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base
from app.models.base import utc_now


class ImportStatus(str, enum.Enum):
    success = "success"
    partial = "partial"
    failed = "failed"
    preview = "preview"


class ImportMode(str, enum.Enum):
    merge = "merge"
    replace = "replace"


class ImportLog(Base):
    __tablename__ = "import_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    dataset_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    import_mode: Mapped[ImportMode] = mapped_column(
        Enum(ImportMode), nullable=False, default=ImportMode.merge
    )
    total_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    success_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skipped_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[ImportStatus] = mapped_column(
        Enum(ImportStatus), nullable=False, default=ImportStatus.preview
    )
    errors_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    imported_by: Mapped[str | None] = mapped_column(String(100), nullable=True, default="admin")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False
    )
