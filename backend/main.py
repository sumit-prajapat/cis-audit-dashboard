from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, scans, reports

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CIS Audit & Compliance Dashboard",
    description="API for running CIS Benchmark checks and tracking compliance over time.",
    version="1.0.0",
)

# Allow React frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(scans.router, prefix="/api", tags=["Scans"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "CIS Audit API is running 🛡️"}
