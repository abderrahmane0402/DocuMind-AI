import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.core.config import settings
from app.core.qdrant import get_qdrant_client
from sentence_transformers import SentenceTransformer

# Load embedding model globally (cached)
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]

@router.post("/", response_model=ChatResponse)
def chat_with_docs(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Embed the query
    query_vector = embed_model.encode(req.query).tolist()
    
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
        
    if not results.points:
        return {"answer": "I couldn't find any relevant documents to answer your question.", "sources": []}
        
    # 3. Construct context and sources
    context_text = ""
    sources = []
    
    for i, res in enumerate(results.points):
        text = res.payload.get("text_content", "")
        page = res.payload.get("page_number", "?")
        doc_id = res.payload.get("document_id", "")
        
        context_text += f"\n--- Source {i+1} (Page {page}) ---\n{text}\n"
        sources.append({
            "document_id": doc_id,
            "page": page,
            "score": res.score
        })
        
    # 4. Construct Prompt
    system_prompt = "You are DocuMind AI, an intelligent assistant. Answer the user's question based strictly on the provided context from their documents. If the answer is not in the context, say 'I don't know based on the provided documents'."
    user_prompt = f"Context:\n{context_text}\n\nQuestion: {req.query}"
    
    # 5. Call Groq API with verify=False to bypass SSL proxy
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "qwen/qwen3.8-27b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.2
    }
    
    try:
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=data,
            verify=False
        )
        response.raise_for_status()
        resp_json = response.json()
        answer = resp_json["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"LLM API Error: {e}")
        # Print actual error text if available from Groq
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        raise HTTPException(status_code=500, detail="Failed to communicate with LLM API.")
        
    return {"answer": answer, "sources": sources}
