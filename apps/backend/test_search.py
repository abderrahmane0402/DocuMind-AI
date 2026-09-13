from sentence_transformers import SentenceTransformer
from app.core.qdrant import get_qdrant_client
from app.core.config import settings

def test_search(query: str):
    print(f"Loading model to search for: '{query}'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    query_vector = model.encode(query).tolist()
    
    qdrant = get_qdrant_client()
    
    print("Querying Qdrant...")
    results = qdrant.query_points(
        collection_name=settings.QDRANT_COLLECTION,
        query=query_vector,
        limit=3
    )
    
    if not results.points:
        print("No results found in Qdrant!")
        return
        
    print(f"Found {len(results.points)} matches!")
    for i, res in enumerate(results.points):
        score = res.score
        text = res.payload.get('text_content', '')
        page = res.payload.get('page_number', '?')
        print(f"\n--- Match {i+1} (Score: {score:.4f}, Page {page}) ---")
        print(text[:250] + "...")

if __name__ == "__main__":
    test_search("What is the general idea of the project?")
