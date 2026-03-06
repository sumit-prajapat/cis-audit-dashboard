from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, scans, reports
import os

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CIS Audit & Compliance Dashboard",
    description="API for running CIS Benchmark checks and tracking compliance over time.",
    version="1.0.0",
)

# CORS — allow local dev + production Vercel frontend
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

# Add production frontend URL from env variable if set
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,    prefix="/auth", tags=["Auth"])
app.include_router(scans.router,   prefix="/api",  tags=["Scans"])
app.include_router(reports.router, prefix="/api",  tags=["Reports"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "CIS Audit API is running 🛡️"}