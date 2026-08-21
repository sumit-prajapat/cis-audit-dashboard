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

# Log the connection attempt (hide password)
safe_url = DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL
logger.info(f"🔌 Connecting to database: ...@{safe_url}")

# Handle both postgresql:// and postgres:// schemes
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    logger.info("📝 Converted postgres:// to postgresql://")

# Add psycopg driver if not present
if DATABASE_URL.startswith("postgresql://") and "postgresql+psycopg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    logger.info("📝 Added psycopg driver to connection string")

# Create engine with connection pooling and health checks
try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Test connections before using them
        pool_size=5,
        max_overflow=10,
        pool_recycle=3600,  # Recycle connections after 1 hour
        echo=False  # Set to True for SQL debugging
    )
    logger.info("✅ Database engine created successfully")
except Exception as e:
    logger.error(f"❌ Failed to create database engine: {e}")
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
