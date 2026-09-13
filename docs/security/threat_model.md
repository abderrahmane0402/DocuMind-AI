# DocuMind AI - Threat Model

## 1. System Overview
DocuMind AI is an enterprise AI document intelligence and RAG platform. It processes sensitive user documents (e.g., invoices, receipts, contracts) and allows users to query them using an LLM.

## 2. Threat Actors
- **Unauthorized External Users:** Attempting to access the platform without valid credentials.
- **Malicious Authenticated Users:** Attempting to access data in other workspaces, escalate privileges, or exploit RAG features (e.g., prompt injection).
- **Compromised Dependencies:** Malicious packages in Python or Node.js ecosystems.

## 3. Key Threats
1. **Data Leakage Across Workspaces:** A bug in the authorization logic might allow a user in Workspace A to read documents or vectors belonging to Workspace B.
2. **Prompt Injection / Jailbreaking:** Malicious text within an uploaded document could instruct the LLM to ignore system prompts and return unauthorized data or perform unintended actions.
3. **Malicious File Uploads:** Uploading executables, malware, or corrupted PDFs intended to exploit the parsing/OCR worker vulnerabilities (e.g., ImageMagick, PyMuPDF vulnerabilities).
4. **Denial of Service (DoS):** Uploading excessively large documents or triggering computationally expensive OCR/Vectorization tasks to exhaust server resources.
5. **Credential Stuffing & Session Hijacking:** Exploiting weak authentication mechanisms or stealing JWT/Session tokens.
6. **Vector Database Poisoning:** Injecting false information into the vector database via malicious uploads to manipulate RAG answers.

## 4. Mitigations
- **Strict Workspace Isolation:** Implement robust Row-Level Security (RLS) or strict ORM filters ensuring `workspace_id` is validated on every request.
- **Sanitized Uploads & Validation:** Validate MIME types by file signature, not just extension. Limit file sizes and reject non-conforming files before processing.
- **Prompt Engineering & Bounded Context:** LLMs will be instructed to only answer based on retrieved context and ignore explicit instructions within the document text.
- **Rate Limiting & Async Processing:** Implement strict rate limits and use Celery queues for processing to prevent synchronous DoS.
- **Secure Authentication:** Use modern hashing, short-lived tokens, secure HttpOnly cookies, and rotating refresh tokens.
