# DocuMind AI - Architecture Decision Records (ADR) Plan

The following ADRs will be created during implementation to document critical architectural decisions:

1. **ADR-001: PostgreSQL for Primary Persistence**
   - Rationale for using PostgreSQL over NoSQL for relational business data, RBAC, and ACID transactions.
2. **ADR-002: Qdrant for Vector Storage**
   - Rationale for using Qdrant (local/Docker compatibility, payload filtering capabilities for workspace isolation).
3. **ADR-003: Celery and Redis for Asynchronous Processing**
   - Decision to use Celery+Redis for background document parsing, OCR, and embedding generation over in-process background tasks.
4. **ADR-004: Local LLM and Embeddings Abstraction**
   - Strategy for abstracting embedding and LLM providers to support local-first development (e.g., SentenceTransformers, Ollama) while allowing future cloud expansion.
5. **ADR-005: Text Chunking and Page Boundary Preservation**
   - Approach to chunking documents while maintaining hard page boundaries for accurate citations.
6. **ADR-006: Workspace Isolation and Row-Level Security**
   - Strategy for enforcing workspace boundaries across relational data (PostgreSQL) and vector data (Qdrant payload filters).
7. **ADR-007: Storage Provider Abstraction**
   - Local filesystem storage abstraction ensuring seamless transition to cloud storage (S3) later.
8. **ADR-008: Trusted Citations Mechanism**
   - Design ensuring the LLM cannot fabricate citations; citation verification occurs entirely on the backend based on vector retrieval data.
