from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

class DocumentBase(BaseModel):
    original_filename: str
    mime_type: str
    file_size_bytes: int
    document_type: Optional[str] = None
    status: str = "uploaded"
    progress: float = 0.0

class DocumentCreate(DocumentBase):
    id: UUID
    workspace_id: UUID
    uploader_id: Optional[UUID] = None
    storage_name: str
    sha256_hash: str
    storage_location: str

class DocumentResponse(DocumentBase):
    id: UUID
    workspace_id: UUID
    uploader_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
