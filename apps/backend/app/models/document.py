import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    uploader_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # File metadata
    original_filename: Mapped[str] = Column(String, nullable=False)
    storage_name: Mapped[str] = Column(String, nullable=False)
    mime_type: Mapped[str] = Column(String, nullable=False)
    file_size_bytes: Mapped[int] = Column(Integer, nullable=False)
    sha256_hash: Mapped[str] = Column(String, nullable=False)
    storage_location: Mapped[str] = Column(String, nullable=False) # e.g. "local", "s3"

    # Processing metadata
    status: Mapped[str] = Column(String, nullable=False, default="uploaded")
    progress: Mapped[float] = Column(Float, nullable=False, default=0.0)
    
    # Extracted metadata
    document_type: Mapped[str] = Column(String, nullable=True)
    classification_confidence: Mapped[float] = Column(Float, nullable=True)
    classifier_name: Mapped[str] = Column(String, nullable=True)
    classifier_version: Mapped[str] = Column(String, nullable=True)
    
    page_count: Mapped[int] = Column(Integer, nullable=True)
    language: Mapped[str] = Column(String, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    workspace = relationship("Workspace", backref="documents")
    uploader = relationship("User")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan", passive_deletes=True)
