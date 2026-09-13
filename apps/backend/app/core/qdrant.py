from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from app.core.config import settings

def get_qdrant_client() -> QdrantClient:
    client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    return client

def init_qdrant():
    try:
        client = get_qdrant_client()
        collection_name = settings.QDRANT_COLLECTION
        
        # Check if collection exists
        if not client.collection_exists(collection_name):
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )
            print(f"Created Qdrant collection: {collection_name}")
        else:
            print(f"Qdrant collection {collection_name} already exists.")
    except Exception as e:
        print(f"Warning: Could not initialize Qdrant collection: {e}")
