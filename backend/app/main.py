import json

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError

from app.api.mentions import router as mentions_router
from app.api.transfer import router as transfer_router
from app.schemas.health import HealthResponse

app = FastAPI(
    title="AI Brand Monitor API",
    version="0.1.0",
    description="Backend API for the AI Brand Monitor MVP.",
)

app.include_router(transfer_router)
app.include_router(mentions_router)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError) -> Response:
    # Do not echo untrusted input; ASCII JSON also safely reports malformed Unicode.
    details = [
        {key: error[key] for key in ("type", "loc", "msg")}
        for error in exc.errors()
    ]
    return Response(
        json.dumps({"detail": details}, ensure_ascii=True),
        status_code=422,
        media_type="application/json",
    )


@app.get("/api/health", response_model=HealthResponse, tags=["system"])
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")
