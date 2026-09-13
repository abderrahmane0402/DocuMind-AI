from app.db.session import SessionLocal
from app.models.user import User
from app.models.workspace import Workspace
from app.models.membership import Membership
from app.models.document import Document
from app.models.document_chunk import DocumentChunk

db = SessionLocal()
docs = db.query(Document).all()
for d in docs:
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == d.id).all()
    print(f'{d.original_filename}: {d.status} ({len(chunks)} chunks extracted)')
    for i, c in enumerate(chunks[:2]):
        print(f"  -> Chunk {i+1}: {c.text_content[:200].replace(chr(10), ' ')}...")
