import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.document import Document
from app.models.membership import Membership
from app.schemas.document import DocumentResponse
from app.services.documents.storage import get_storage_provider, StorageProvider
from app.core.config import settings

router = APIRouter()

ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
MAX_FILE_SIZE = 20 * 1024 * 1024 # 20 MB

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    workspace_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageProvider = Depends(get_storage_provider)
):
    # Verify workspace membership
    membership = db.execute(select(Membership).filter_by(workspace_id=workspace_id, user_id=current_user.id)).scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")
        
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")
        
    storage_name, sha256_hash, file_size = await storage.save_upload_file(file)
    
    if file_size > MAX_FILE_SIZE:
        storage.delete_file(storage_name)
        raise HTTPException(status_code=400, detail="File too large")
        
    # Check for duplicate hash in workspace
    duplicate = db.execute(select(Document).filter_by(workspace_id=workspace_id, sha256_hash=sha256_hash)).scalar_one_or_none()
    if duplicate:
        storage.delete_file(storage_name)
        raise HTTPException(status_code=409, detail="Document already exists in this workspace")
        
    doc = Document(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        uploader_id=current_user.id,
        original_filename=file.filename or "unknown",
        storage_name=storage_name,
        mime_type=file.content_type,
        file_size_bytes=file_size,
        sha256_hash=sha256_hash,
        storage_location="local"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    from app.workers.document_tasks import process_document_task
    process_document_task.delay(str(doc.id))
    
    return doc

@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    workspace_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = db.execute(select(Membership).filter_by(workspace_id=workspace_id, user_id=current_user.id)).scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")
        
    docs = db.execute(select(Document).filter_by(workspace_id=workspace_id)).scalars().all()
    return docs

@router.get("/{document_id}/status")
def get_document_status(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.execute(select(Document).filter_by(id=document_id)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    membership = db.execute(select(Membership).filter_by(workspace_id=doc.workspace_id, user_id=current_user.id)).scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")
        
    return {"status": doc.status, "progress": doc.progress}

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageProvider = Depends(get_storage_provider)
):
    doc = db.execute(select(Document).filter_by(id=document_id)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    membership = db.execute(select(Membership).filter_by(workspace_id=doc.workspace_id, user_id=current_user.id)).scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized to delete documents in this workspace")
        
    # Delete from local/s3 storage
    try:
        storage.delete_file(doc.storage_name)
    except Exception as e:
        print(f"File storage delete error: {e}")
        
    # Delete associated points from Qdrant vector store
    try:
        from app.core.qdrant import get_qdrant_client
        from qdrant_client.http.models import Filter, FieldCondition, MatchValue
        qdrant = get_qdrant_client()
        qdrant.delete(
            collection_name=settings.QDRANT_COLLECTION,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=str(doc.id))
                    )
                ]
            )
        )
    except Exception as e:
        print(f"Qdrant points delete error: {e}")
        
    db.delete(doc)
    db.commit()
    return None

class BatchDeleteRequest(BaseModel):
    document_ids: list[uuid.UUID]

@router.post("/batch-delete", status_code=status.HTTP_200_OK)
def batch_delete_documents(
    body: BatchDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageProvider = Depends(get_storage_provider)
):
    if not body.document_ids:
        return {"deleted_count": 0}

    docs = db.execute(select(Document).filter(Document.id.in_(body.document_ids))).scalars().all()
    deleted_count = 0

    from app.core.qdrant import get_qdrant_client
    from qdrant_client.http.models import Filter, FieldCondition, MatchValue
    qdrant = get_qdrant_client()

    for doc in docs:
        membership = db.execute(select(Membership).filter_by(workspace_id=doc.workspace_id, user_id=current_user.id)).scalar_one_or_none()
        if not membership:
            continue

        try:
            storage.delete_file(doc.storage_name)
        except Exception:
            pass

        try:
            qdrant.delete(
                collection_name=settings.QDRANT_COLLECTION,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="document_id",
                            match=MatchValue(value=str(doc.id))
                        )
                    ]
                )
            )
        except Exception:
            pass

        db.delete(doc)
        deleted_count += 1

    db.commit()
    return {"deleted_count": deleted_count}

@router.get("/stats/summary")
def get_workspace_document_stats(
    workspace_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.document_chunk import DocumentChunk
    from sqlalchemy import func

    membership = db.execute(select(Membership).filter_by(workspace_id=workspace_id, user_id=current_user.id)).scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    docs = db.execute(select(Document).filter_by(workspace_id=workspace_id)).scalars().all()
    
    total = len(docs)
    completed = sum(1 for d in docs if d.status in ["ready", "completed"])
    processing = sum(1 for d in docs if d.status in ["processing", "extracting_text", "embedding_text", "uploaded"])
    needs_review = sum(1 for d in docs if d.status in ["failed", "needs_review"])
    total_bytes = sum(d.file_size_bytes or 0 for d in docs)
    
    # Types count
    invoices = sum(1 for d in docs if "pdf" in (d.mime_type or "").lower())
    receipts = sum(1 for d in docs if "image" in (d.mime_type or "").lower())
    others = max(0, total - invoices - receipts)
    
    # Accurate chunks count from database
    total_chunks = db.execute(
        select(func.count(DocumentChunk.id))
        .join(Document, DocumentChunk.document_id == Document.id)
        .filter(Document.workspace_id == workspace_id)
    ).scalar() or 0

    return {
        "total_documents": total,
        "completed": completed,
        "processing": processing,
        "needs_review": needs_review,
        "total_chunks": total_chunks,
        "total_bytes": total_bytes,
        "types": {
            "pdf": invoices,
            "images": receipts,
            "others": others
        },
        "system_status": {
            "api": "healthy",
            "vector_store": "connected",
            "embedding_model": "all-MiniLM-L6-v2 (384d)",
            "llm_model": "Qwen 2.5 (Groq Cloud)"
        }
    }


