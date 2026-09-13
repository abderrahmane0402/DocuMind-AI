# Base Python image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Set workdir
WORKDIR /app

# Install system dependencies (Tesseract OCR, Poppler for PDF processing, build essentials)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY . .

# Create non-root user and uploads directory
RUN mkdir -p /app/data/uploads && \
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose FastAPI port
EXPOSE 8000

# Default command runs Uvicorn ASGI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]