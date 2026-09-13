import requests
import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.chat_session import ChatSession, ChatMessage
from app.db.session import SessionLocal
from app.core.config import settings
from app.core.qdrant import get_qdrant_client
from sentence_transformers import SentenceTransformer

# Load embedding model globally (cached)
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    session_id: str | None = None
    messages: list[Message]

class CreateSessionRequest(BaseModel):
    title: str | None = "New Conversation"

class UpdateSessionRequest(BaseModel):
    title: str

# ----------------- Session CRUD Endpoints ----------------- #

@router.get("/sessions")
def list_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all chat sessions belonging to the logged-in user."""
    sessions = db.execute(
        select(ChatSession)
        .filter_by(user_id=current_user.id)
        .order_by(desc(ChatSession.updated_at))
    ).scalars().all()

    return [
        {
            "id": str(s.id),
            "title": s.title,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None,
            "message_count": len(s.messages)
        }
        for s in sessions
    ]

@router.post("/sessions", status_code=status.HTTP_201_CREATED)
def create_chat_session(
    body: CreateSessionRequest = CreateSessionRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Explicitly create a new chat session."""
    session = ChatSession(
        user_id=current_user.id,
        title=body.title or "New Conversation"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {
        "id": str(session.id),
        "title": session.title,
        "created_at": session.created_at.isoformat(),
        "updated_at": session.updated_at.isoformat(),
        "message_count": 0
    }

@router.get("/sessions/{session_id}/messages")
def get_session_messages(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all messages for a specific session."""
    session = db.execute(
        select(ChatSession).filter_by(id=session_id, user_id=current_user.id)
    ).scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return [
        {
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in session.messages
    ]

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a chat session and all its messages."""
    session = db.execute(
        select(ChatSession).filter_by(id=session_id, user_id=current_user.id)
    ).scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    db.delete(session)
    db.commit()
    return None

# ----------------- Streaming Endpoint with Persistence ----------------- #

@router.post("/stream")
def chat_with_docs_stream(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not req.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    # 1. Resolve or create chat session
    active_session = None
    if req.session_id:
        try:
            sess_uuid = uuid.UUID(req.session_id)
            active_session = db.execute(
                select(ChatSession).filter_by(id=sess_uuid, user_id=current_user.id)
            ).scalar_one_or_none()
        except Exception:
            active_session = None

    if not active_session:
        active_session = ChatSession(
            user_id=current_user.id,
            title="New Conversation"
        )
        db.add(active_session)
        db.commit()
        db.refresh(active_session)

    session_id_str = str(active_session.id)

    # 2. Persist latest user message & auto-generate title if it's the first message
    latest_user_message = req.messages[-1]
    if latest_user_message.role in ["user"]:
        user_msg_db = ChatMessage(
            session_id=active_session.id,
            role="user",
            content=latest_user_message.content
        )
        db.add(user_msg_db)

        # Generate a smart session title from the first prompt if default title
        if active_session.title in ["New Conversation", "New Chat", ""]:
            cleaned_title = latest_user_message.content.strip().replace("\n", " ")
            active_session.title = cleaned_title[:35] + ("..." if len(cleaned_title) > 35 else "")

        active_session.updated_at = datetime.now(timezone.utc)
        db.commit()

    # 3. Search Qdrant for semantic context
    latest_query = latest_user_message.content
    query_vector = embed_model.encode(latest_query).tolist()
    
    qdrant = get_qdrant_client()
    try:
        results = qdrant.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=query_vector,
            limit=5
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qdrant search failed: {e}")
        
    context_text = ""
    if results.points:
        for i, res in enumerate(results.points):
            text = res.payload.get("text_content", "")
            page = res.payload.get("page_number", "?")
            doc_id = res.payload.get("document_id", "")
            
            doc_obj = db.execute(select(Document).filter_by(id=doc_id)).scalar_one_or_none() if doc_id else None
            doc_name = doc_obj.original_filename if doc_obj else f"Document {str(doc_id)[:6]}.pdf"
            context_text += f"\n--- Source {i+1} ({doc_name}, Page {page}) ---\n{text}\n"

    system_prompt = (
        "You are DocuMind AI, an intelligent assistant. Answer the user's question directly, clearly, and concisely based strictly on the provided context from their documents. "
        "Do not include citations, source tags, or page numbers in your answers. "
        "If the answer is not in the context, just say you don't know based on the provided documents. Context:\n" + context_text
    )

    # 4. Construct Messages array for Groq
    messages_for_llm = [{"role": "system", "content": system_prompt}]
    for m in req.messages:
        role = "assistant" if m.role in ["ai", "assistant"] else "user"
        messages_for_llm.append({"role": role, "content": m.content})
    
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "qwen/qwen3.8-27b",
        "messages": messages_for_llm,
        "temperature": 0.2,
        "stream": True
    }
    
    def generate_stream():
        # Emit session metadata first
        yield f"data: {json.dumps({'type': 'session', 'session_id': session_id_str, 'title': active_session.title})}\n\n"
        
        full_ai_response = ""
        try:
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            
            with requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=data,
                verify=False,
                stream=True
            ) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line:
                        line_text = line.decode('utf-8')
                        if line_text.startswith("data: "):
                            data_str = line_text[6:]
                            if data_str == "[DONE]":
                                break
                            chunk = json.loads(data_str)
                            if "choices" in chunk and len(chunk["choices"]) > 0:
                                delta = chunk["choices"][0].get("delta", {})
                                if "content" in delta:
                                    content = delta["content"]
                                    full_ai_response += content
                                    yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"
        except Exception as e:
            print(f"LLM API Error: {e}")
            err_msg = f"Sorry, an error occurred while connecting to the LLM: {str(e)}"
            full_ai_response += err_msg
            yield f"data: {json.dumps({'type': 'content', 'content': err_msg})}\n\n"
        finally:
            # 5. Save the complete AI assistant response to the database
            if full_ai_response:
                try:
                    with SessionLocal() as save_db:
                        ai_msg = ChatMessage(
                            session_id=uuid.UUID(session_id_str),
                            role="assistant",
                            content=full_ai_response
                        )
                        save_db.add(ai_msg)
                        
                        sess = save_db.execute(select(ChatSession).filter_by(id=uuid.UUID(session_id_str))).scalar_one_or_none()
                        if sess:
                            sess.updated_at = datetime.now(timezone.utc)
                        save_db.commit()
                except Exception as save_err:
                    print(f"Failed to persist assistant response: {save_err}")
            
        yield "data: [DONE]\n\n"
        
    return StreamingResponse(generate_stream(), media_type="text/event-stream")
