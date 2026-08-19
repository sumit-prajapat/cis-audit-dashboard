"""
main.py — CIS Audit SaaS API v2.0
Enhanced with: Service Layer, RBAC, Error Handling, Audit Logging
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from routes import auth, scans, reports, billing, orgs, compliance
from middleware import setup_error_handlers
import os
from dotenv import load_dotenv
import logging
from mangum import Mangum  # For Vercel deployment

load_dotenv()

# Validate critical environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-123")
if "change-in-production" in SECRET_KEY.lower() or SECRET_KEY == "fallback-secret-key-123":
    if os.getenv("APP_ENV") == "production":
        raise ValueError("❌ SECRET_KEY not set! Run: python generate_secret.py")
    logging.warning("⚠️  Using default SECRET_KEY - NOT FOR PRODUCTION!")

# Setup logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Create FastAPI app
app = FastAPI(
    title       = "CIS Audit Dashboard — Enterprise SaaS API",
    description = "Production-grade CIS Benchmark security auditing with multi-tenant SaaS capabilities",
    version     = "3.0.0",
    docs_url    = "/api/docs",
    redoc_url   = "/api/redoc",
    openapi_url = "/api/openapi.json"
)

# ── Database Initialization ──────────────────────────────
@app.on_event("startup")
def initialize_database():
    """
    Database initialization handled by Alembic migrations.
    Run 'alembic upgrade head' to apply migrations.
    
    For development, we keep create_all() as a fallback, but in production
    this should be removed and migrations should be run during deployment.
    """
    if os.getenv("APP_ENV", "development") == "development":
        # Development fallback - ensure tables exist
        Base.metadata.create_all(bind=engine)
        logging.info("Development mode: Ensured database tables exist via create_all()")
    else:
        # Production: rely on Alembic migrations only
        logging.info("Production mode: Use 'alembic upgrade head' to apply migrations")


# ── CORS Configuration ───────────────────────────────────
origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",") if origin.strip()]

FRONTEND_URL = os.getenv("FRONTEND_URL", "")
if FRONTEND_URL and FRONTEND_URL not in origins:
    origins.append(FRONTEND_URL)

# Add Vercel and Hugging Face URLs
vercel_url = "https://cis-audit-dashboard.vercel.app"
hf_url = "https://mk1311-cis-audit-api.hf.space"
if vercel_url not in origins:
    origins.append(vercel_url)
if hf_url not in origins:
    origins.append(hf_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = origins,
    allow_credentials = True,
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers     = ["Authorization", "Content-Type", "X-CSRF-Token", "X-Requested-With"],
    expose_headers    = ["Set-Cookie"],
    max_age          = 3600,
)

# ── Security Middlewares ─────────────────────────────────
from middleware.rate_limiter import RateLimiterMiddleware
from middleware.security_headers import SecurityHeadersMiddleware
from middleware.csrf_protection import CSRFMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Add Session Middleware (required for some CSRF/auth flows)
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "fallback-secret-key-123"))

# Add Trusted Host Middleware (Strict Host headers)
if os.getenv("APP_ENV") != "test":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"])

# Add Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add CSRF Middleware for unsafe requests that rely on cookies
app.add_middleware(
    CSRFMiddleware,
    exempt_paths={"/auth/login", "/auth/logout", "/auth/logout-all", "/auth/register", "/auth/refresh", "/auth/password-reset/request", "/auth/password-reset/confirm", "/auth/verify-email", "/auth/verify-email/request"},
)

# Add Rate Limiting Middleware
app.add_middleware(RateLimiterMiddleware, requests_limit=5000, window_seconds=3600)

# ── Error Handlers ───────────────────────────────────────
setup_error_handlers(app)

# ── API Routers ──────────────────────────────────────────
app.include_router(auth.router,       prefix="/auth",     tags=["Auth"])
app.include_router(scans.router,      prefix="/api",      tags=["Scans"])
app.include_router(reports.router,    prefix="/api",      tags=["Reports"])
app.include_router(billing.router,    prefix="/billing",  tags=["Billing"])
app.include_router(orgs.router,       prefix="/orgs",     tags=["Organizations"])
app.include_router(compliance.router, prefix="/api",      tags=["Compliance"])

# ── Health Check ─────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "CIS Audit SaaS API v3.0.0 - Production Ready",
        "version": "3.0.0",
        "environment": os.getenv("APP_ENV", "development"),
        "features": [
            "Multi-Tenancy",
            "RBAC",
            "Audit Logging",
            "Service Layer Architecture",
            "Enterprise Error Handling",
            "Database Migrations (Alembic)"
        ]
    }


@app.get("/health", tags=["Health"])
def liveness_probe():
    """Kubernetes liveness probe - quick check"""
    return {"status": "alive"}


@app.get("/health/ready", tags=["Health"])
def readiness_probe(db: Session = Depends(get_db)):
    """Kubernetes readiness probe - checks DB connection"""
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        logging.error(f"Database health check failed: {e}")
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "database": "disconnected", "error": str(e)}
        )


# ── Vercel Serverless Handler ────────────────────────────
handler = Mangum(app, lifespan="off")
