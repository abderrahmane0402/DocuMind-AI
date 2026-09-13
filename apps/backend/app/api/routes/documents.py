import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.document import Document
from app.models.membership import Membership
from app.schemas.document import DocumentResponse
from app.services.documents.storage import get_storage_provider, StorageProvider

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
    if not membership or membership.role not in ["admin", "uploader", "reviewer", "owner"]: # simplified check
        raise HTTPException(status_code=403, detail="Not authorized to delete documents in this workspace")
        
    storage.delete_file(doc.storage_name)
    db.delete(doc)
    db.commit()
    return None

@router.get("/stats/summary")
def get_workspace_document_stats(
    workspace_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = db.execute(select(Membership).filter_by(workspace_id=workspace_id, user_id=current_user.id)).scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    docs = db.execute(select(Document).filter_by(workspace_id=workspace_id)).scalars().all()
    
    total = len(docs)
    completed = sum(1 for d in docs if d.status == "completed")
    processing = sum(1 for d in docs if d.status == "processing")
    needs_review = sum(1 for d in docs if d.status in ["failed", "needs_review"])
    
    # Types count
    invoices = sum(1 for d in docs if "pdf" in (d.mime_type or "").lower())
    receipts = sum(1 for d in docs if "image" in (d.mime_type or "").lower())
    others = total - invoices - receipts
    
    # Accurate accuracy indicator: 100% if all completed, 0% if none, etc.
    accuracy = round((completed / total * 100), 1) if total > 0 else 0.0

    return {
        "total_documents": total,
        "processed_today": completed,
        "needs_review": needs_review,
        "processing": processing,
        "extraction_accuracy": accuracy,
        "types": {
            "invoices": invoices,
            "receipts": receipts,
            "others": max(0, others)
        }
    }

