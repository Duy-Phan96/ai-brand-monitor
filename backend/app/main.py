from fastapi import FastAPI

from app.schemas.health import HealthResponse

app = FastAPI(
    title="AI Brand Monitor API",
    version="0.1.0",
    description="Backend API for the AI Brand Monitor MVP.",
)


@app.get("/api/health", response_model=HealthResponse, tags=["system"])
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")
