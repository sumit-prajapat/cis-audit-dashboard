"""
main.py — CIS Audit SaaS API
Phase 1: Added billing + orgs routers, updated CORS for SaaS
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, scans, reports, billing, orgs
import os

# Create all tables on startup (safe — uses IF NOT EXISTS)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title       = "CIS Audit Dashboard — SaaS API",
    description = "Automated CIS Benchmark security auditing with multi-tenant SaaS.",
    version     = "2.0.0",
)

# ── CORS ─────────────────────────────────────────────────
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

FRONTEND_URL = os.getenv("FRONTEND_URL", "")
if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = origins,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers ───────────────────────────────────────────────
app.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
app.include_router(scans.router,    prefix="/api",      tags=["Scans"])
app.include_router(reports.router,  prefix="/api",      tags=["Reports"])
app.include_router(billing.router,  prefix="/billing",  tags=["Billing"])
app.include_router(orgs.router,     prefix="/orgs",     tags=["Organizations"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "CIS Audit SaaS API v2.0.0", "version": "2.0.0"}
