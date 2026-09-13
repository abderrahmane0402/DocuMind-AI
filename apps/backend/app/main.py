from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.get("/health/live")
def health_live():
    return {"status": "ok"}

@app.get("/health/ready")
def health_ready():
    # Will check db/redis in the future
    return {"status": "ready"}\n