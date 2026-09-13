import os
import pymupdf
import pytesseract
from PIL import Image
import uuid
from sqlalchemy.orm import Session
from qdrant_client.http.models import PointStruct
from sentence_transformers import SentenceTransformer
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.workspace import Workspace
from app.models.membership import Membership
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.documents.storage import get_storage_provider
from app.core.qdrant import get_qdrant_client
from app.core.config import settings

# Load model globally in the worker so it doesn't reload per task
# Note: The first time this runs, it will download ~90MB.
model = SentenceTransformer('all-MiniLM-L6-v2')

@celery_app.task(bind=True)
def process_document_task(self, document_id: str):
    db: Session = SessionLocal()
    qdrant = get_qdrant_client()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return
            
        doc.status = "extracting_text"
        doc.progress = 0.1
        db.commit()
        
        storage = get_storage_provider()
        file_path = storage.get_file_path(doc.storage_name)
        
        if not os.path.exists(file_path):
            doc.status = "failed"
            db.commit()
            return
            
        # Open with PyMuPDF
        pdf_document = pymupdf.open(file_path)
        total_pages = len(pdf_document)
        
        chunk_index = 0
        extracted_chunks = []
        for page_num in range(total_pages):
            page = pdf_document.load_page(page_num)
            text = page.get_text("text").strip()
            
            # Fallback to OCR if no digital text is found on the page
            if not text:
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                try:
                    text = pytesseract.image_to_string(img).strip()
                except Exception as e:
                    print(f"OCR failed for page {page_num}: {e}")
                    text = ""
            
            if text:
                chunk_id = uuid.uuid4()
                chunk = DocumentChunk(
                    id=chunk_id,
                    document_id=doc.id,
                    page_number=page_num + 1,
                    chunk_index=chunk_index,
                    text_content=text
                )
                db.add(chunk)
                extracted_chunks.append({
                    "id": str(chunk_id),
                    "text": text,
                    "page": page_num + 1,
                    "chunk_index": chunk_index
                })
                chunk_index += 1
                
            doc.progress = 0.1 + (0.4 * (page_num + 1) / total_pages)
            db.commit()
            
        doc.status = "embedding_text"
        db.commit()
        
        # Generate embeddings
        if extracted_chunks:
            texts = [c["text"] for c in extracted_chunks]
            embeddings = model.encode(texts, show_progress_bar=False)
            
            # Push to Qdrant
            points = []
            for i, chunk_data in enumerate(extracted_chunks):
                points.append(
                    PointStruct(
                        id=chunk_data["id"],
                        vector=embeddings[i].tolist(),
                        payload={
                            "document_id": str(doc.id),
                            "workspace_id": str(doc.workspace_id),
                            "page_number": chunk_data["page"],
                            "chunk_index": chunk_data["chunk_index"],
                            "text_content": chunk_data["text"]
                        }
                    )
                )
            
            qdrant.upsert(
                collection_name=settings.QDRANT_COLLECTION,
                points=points
            )
            
        doc.status = "ready"
        doc.progress = 1.0
        db.commit()
        
    except Exception as e:
        print(f"Task failed: {str(e)}")
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = "failed"
            db.commit()
    finally:
        db.close()
