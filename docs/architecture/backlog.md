# DocuMind AI - Backlog

## Phase 1: Foundation
- [ ] Initialize monorepo structure.
- [ ] Set up FastAPI backend, React/Vite frontend.
- [ ] Create Docker Compose for PostgreSQL, Redis, Qdrant.
- [ ] Configure linting, formatting, type checking.
- [ ] Implement health endpoints.
- [ ] Setup basic CI workflow.

## Phase 2: Authentication and Workspaces
- [ ] Database models for User, Workspace, Membership.
- [ ] JWT Auth implementation (register, login, refresh, logout).
- [ ] Role-Based Access Control and workspace isolation.
- [ ] Frontend authentication forms and state management.

## Phase 3: Document Management
- [ ] Storage provider abstraction (local for now).
- [ ] Document upload API with MIME/size validation.
- [ ] Duplicate detection via SHA-256.
- [ ] Frontend document list, upload center, and progress tracking.

## Phase 4: Processing Infrastructure
- [ ] Set up Celery worker and Redis message broker.
- [ ] Define state machine for document processing.
- [ ] Implement retry policies and failure handling.

## Phase 5: PDF Extraction and OCR
- [ ] Direct text parsing using PyMuPDF.
- [ ] Scanned page detection heuristic.
- [ ] OCR fallback integration (Tesseract/PaddleOCR).

## Phase 6: Classification and Invoice Extraction
- [ ] Document classifier baseline.
- [ ] Invoice extraction pipeline (RegEx + heuristics + Schema).
- [ ] Business rule validation (Decimal math).
- [ ] Confidence scoring system.

## Phase 7: Human Validation UI
- [ ] Split-screen frontend (Document Preview | Fields).
- [ ] Review workflow (Confirm, Correct, Reject).
- [ ] Audit trail for human corrections.

## Phase 8: Vector Indexing
- [ ] Text chunking logic preserving page boundaries.
- [ ] Local embeddings generation (Sentence Transformers).
- [ ] Qdrant indexing and workspace filtering.

## Phase 9: RAG Chat
- [ ] LLM provider abstraction (Ollama).
- [ ] Conversation and Message APIs.
- [ ] Grounded generation with trusted citations.
- [ ] Frontend RAG chat with expandable evidence.

## Phase 10: Evaluation
- [ ] Create synthetic evaluation datasets.
- [ ] Metrics calculation (Recall, Precision, Latency).

## Phase 11: Dashboard and Administration
- [ ] Real-time metrics dashboard.
- [ ] Admin panel (User management, Audit logs).

## Phase 12: Security and Observability
- [ ] Rate limits, security headers.
- [ ] Structured logging, telemetry.

## Phase 13: Release Preparation
- [ ] Final documentation, demos, and portfolio materials.
