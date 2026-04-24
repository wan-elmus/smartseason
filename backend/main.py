from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os

from core.config import settings
from core.database import init_db
from routers import auth_router, fields_router, updates_router, dashboard_router, ai_router, upload_router, users_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    try:
        await init_db()
        logger.info("Database initialized successfully")
        
        from sqlalchemy import select, func
        from core.database import AsyncSessionLocal
        from core.models import User
        
        async with AsyncSessionLocal() as session:
            user_count = await session.execute(select(func.count()).select_from(User))
            if user_count.scalar() == 0:
                logger.warning("Database empty. Run seeding manually with: python3 -m db.seed")
                
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

    logger.info(f"Server ready on http://{settings.SERVER_HOST}:{settings.SERVER_PORT}")
    yield

    logger.info("Shutting down...")
    logger.info("Shutdown complete")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SmartSeason Field Monitoring System for Agricultural Management",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan,
)

uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        # allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_origins=["*"], 
        allow_credentials=True,
        # allow_methods=["*"],
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.ENVIRONMENT == "development" else None,
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


app.include_router(auth_router, prefix="/v4", tags=["Authentication"])
app.include_router(fields_router, prefix="/v4", tags=["Fields"])
app.include_router(updates_router, prefix="/v4", tags=["Updates"])
app.include_router(dashboard_router, prefix="/v4", tags=["Dashboard"])
app.include_router(ai_router, prefix="/v4", tags=["AI Features"])
app.include_router(upload_router, prefix="/v4", tags=["File Upload"])
app.include_router(users_router, prefix="/v4", tags=["Users"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.SERVER_RELOAD,
        log_level="info",
    )