import requests
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
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
    messages: list[Message]

@router.post("/stream")
def chat_with_docs_stream(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not req.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    # 1. Get the latest user query to search Qdrant
    latest_query = req.messages[-1].content
    query_vector = embed_model.encode(latest_query).tolist()
    
    # 2. Search Qdrant
    qdrant = get_qdrant_client()
    try:
        results = qdrant.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=query_vector,
            limit=5
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qdrant search failed: {e}")
        
    # 3. Construct context and sources
    context_text = ""
    sources = []
    
    if results.points:
        for i, res in enumerate(results.points):
            text = res.payload.get("text_content", "")
            page = res.payload.get("page_number", "?")
            doc_id = res.payload.get("document_id", "")
            
            doc_obj = db.execute(select(Document).filter_by(id=doc_id)).scalar_one_or_none() if doc_id else None
            doc_name = doc_obj.original_filename if doc_obj else f"Document {str(doc_id)[:6]}.pdf"
            
            context_text += f"\n--- Source {i+1} ({doc_name}, Page {page}) ---\n{text}\n"
            sources.append({
                "document_id": doc_id,
                "document_name": doc_name,
                "page": page,
                "score": float(res.score) if res.score else 0.95,
                "snippet": (text[:180].strip() + "...") if len(text) > 180 else text.strip()
            })
            
    system_prompt = "You are DocuMind AI, an intelligent assistant. Answer the user's question based strictly on the provided context from their documents. If the answer is not in the context, just say you don't know based on the provided documents. Context:\n" + context_text

    # 4. Construct Messages array for Groq (ensuring standard OpenAI/Groq roles: system, user, assistant)
    messages_for_llm = [{"role": "system", "content": system_prompt}]
    for m in req.messages:
        role = "assistant" if m.role in ["ai", "assistant"] else "user"
        messages_for_llm.append({"role": role, "content": m.content})
    
    # 5. Call Groq API with streaming
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
        # Yield the sources first as a special event
        yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
        
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
                                    yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"
        except Exception as e:
            print(f"LLM API Error: {e}")
            yield f"data: {json.dumps({'type': 'content', 'content': f'Sorry, an error occurred while connecting to the LLM: {str(e)}'})}\n\n"
            
        yield "data: [DONE]\n\n"
        
    return StreamingResponse(generate_stream(), media_type="text/event-stream")
