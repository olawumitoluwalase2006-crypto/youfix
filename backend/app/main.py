import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.gemini_service import gemini_service
from app.supabase_service import supabase_service
from app.schemas import HealthResponse
from app.routes.diagnose import router as diagnose_router
from app.routes.history import router as history_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("youfix")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    logger.info("=" * 60)
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Gemini Vision configured: {gemini_service.is_configured()}")
    logger.info(f"Supabase configured: {supabase_service.is_configured()}")
    logger.info(f"CORS Allowed Origins: {settings.cors_origins}")
    logger.info("=" * 60)
    yield
    logger.info("Shutting down YouFix API...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production REST API for YouFix: Instant AI-powered fault diagnosis, "
        "hazard risk classification, and safety-enforced DIY repair guides."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
# Allows Next.js frontend (local and deployed on Vercel) to interact seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(diagnose_router)
app.include_router(history_router)


@app.get("/", tags=["System"])
async def root():
    """Welcome and quick API index."""
    return {
        "project": "YouFix API",
        "description": "AI-Powered Fault Diagnosis & Repair Platform",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "status": "operational"
    }


@app.get("/health", response_model=HealthResponse, tags=["System"])
@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Health check probe for Railway, Render, and Vercel frontends.
    """
    return HealthResponse(
        status="ok",
        service="YouFix Backend API",
        version=settings.VERSION,
        gemini_configured=gemini_service.is_configured(),
        supabase_configured=supabase_service.is_configured(),
        environment=settings.ENVIRONMENT
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global catch-all exception handler returning standard JSON format."""
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else "An unexpected error occurred.",
            "path": request.url.path
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", settings.PORT))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
