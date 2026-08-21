from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.error("❌ DATABASE_URL environment variable not set!")
    raise ValueError("DATABASE_URL environment variable is required")

# Log the connection attempt (hide password for security)
try:
    if '@' in DATABASE_URL:
        parts = DATABASE_URL.split('@')
        safe_url = f"...@{parts[1]}" if len(parts) > 1 else "..."
    else:
        safe_url = "..."
    logger.info(f"🔌 Connecting to database: {safe_url}")
except:
    logger.info("🔌 Connecting to database")

# Handle postgres:// vs postgresql:// prefix
original_url = DATABASE_URL
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    logger.info("📝 Converted postgres:// to postgresql://")

# Ensure psycopg driver is specified for PostgreSQL
if DATABASE_URL.startswith("postgresql://") and "+psycopg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    logger.info("📝 Added psycopg driver")

# Create engine with robust settings for cloud databases
try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=5,  # Connection pool size
        max_overflow=10,  # Max overflow connections  
        pool_recycle=300,  # Recycle connections every 5 minutes (important for Supabase)
        pool_timeout=30,  # Wait up to 30 seconds for connection
        echo=False  # Set to True to debug SQL queries
    )
    
    # Test the connection immediately
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    
    logger.info("✅ Database engine created and tested successfully")
    
except Exception as e:
    logger.error(f"❌ Failed to create database engine: {str(e)}")
    logger.error(f"   Connection string format: {safe_url}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
