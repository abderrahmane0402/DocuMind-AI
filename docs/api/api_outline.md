# DocuMind AI - API Outline

**Base URL:** `/api/v1`

## Health
- `GET /health/live` - Check if API is responsive
- `GET /health/ready` - Check connections to PostgreSQL, Redis, Qdrant, Workers

## Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate and receive tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate tokens
- `GET /auth/me` - Get current user profile

## Documents
- `POST /documents` - Upload a new document (multipart/form-data)
- `GET /documents` - List documents in workspace (with pagination/filters)
- `GET /documents/{document_id}` - Get document details
- `DELETE /documents/{document_id}` - Delete document and associated vectors
- `GET /documents/{document_id}/status` - Check async processing status
- `POST /documents/{document_id}/reprocess` - Trigger reprocessing
- `GET /documents/{document_id}/pages` - Get extracted page data

## Extraction and Review
- `GET /documents/{document_id}/extractions` - Get extracted fields
- `PATCH /documents/{document_id}/extractions/{field_id}` - Review/correct a field
- `POST /documents/{document_id}/validate` - Approve document validation

## Conversations (RAG)
- `POST /conversations` - Start a new RAG conversation
- `GET /conversations` - List conversations for user in workspace
- `GET /conversations/{conversation_id}` - Get conversation history
- `POST /conversations/{conversation_id}/messages` - Send a new question to RAG
- `DELETE /conversations/{conversation_id}` - Delete conversation

## Analytics and Administration
- `GET /analytics/overview` - High-level metrics
- `GET /analytics/documents` - Processing success rates, trends
- `GET /analytics/extractions` - Confidence distributions
- `GET /analytics/rag` - RAG usage and feedback scores
- `GET /admin/users` - Manage users (admin only)
- `PATCH /admin/users/{user_id}` - Update user roles (admin only)
- `GET /admin/audit-logs` - View system audit events (admin only)
- `GET /admin/system-status` - Check dependency and worker health (admin only)
