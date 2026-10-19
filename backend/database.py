"""
Database configuration for CIS Audit Dashboard
Handles SQLite (development) and PostgreSQL (production) with automatic failover
"""
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.warning("⚠️  DATABASE_URL not set - using SQLite fallback")
    DATABASE_URL = "sqlite:///./cis_audit.db"

# Log connection attempt (hide sensitive info)
try:
    if '@' in DATABASE_URL and not DATABASE_URL.startswith('sqlite'):
        parts = DATABASE_URL.split('@')
        safe_url = f"...@{parts[1]}" if len(parts) > 1 else "..."
    else:
        safe_url = DATABASE_URL.split('///')[0] + '///.../...'  if '///' in DATABASE_URL else "..."
    logger.info(f"🔌 Connecting to database: {safe_url}")
except:
    logger.info("🔌 Connecting to database")

# URL preprocessing for PostgreSQL
original_url = DATABASE_URL

# Step 1: Convert postgres:// to postgresql://
if DATABASE_URL.startswith("postgres://") and not DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    logger.info("📝 Converted postgres:// to postgresql://")

# Step 2: Add psycopg driver (psycopg3, not psycopg2)
if DATABASE_URL.startswith("postgresql://"):
    if "+psycopg" not in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
        # Use psycopg (psycopg3) - already in requirements.txt
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
        logger.info("📝 Added psycopg driver for PostgreSQL")

# Determine database type
is_sqlite = DATABASE_URL.startswith("sqlite")
is_postgres = DATABASE_URL.startswith("postgresql")

# Create engine with appropriate configuration
engine = None
engine_error = None

try:
    if is_sqlite:
        # SQLite configuration for development
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            echo=False,
            future=True
        )
        logger.info("💾 Database type: SQLite (development)")
    
    elif is_postgres:
        # PostgreSQL configuration for production (Render, Railway, etc.)
        engine = create_engine(
            DATABASE_URL,
            poolclass=NullPool,  # Use NullPool for serverless/free tier (prevents connection pool exhaustion)
            connect_args={
                "connect_timeout": 10,
                "options": "-c statement_timeout=30000"  # 30 second query timeout
            },
            echo=False,
            future=True
        )
        logger.info("💾 Database type: PostgreSQL (production)")
    
    else:
        # Unsupported database type
        logger.error(f"❌ Unsupported database URL format: {DATABASE_URL[:20]}...")
        raise ValueError(f"Unsupported database type. Use SQLite or PostgreSQL.")
    
    # Test the connection
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
        conn.commit()
    
    logger.info("✅ Database engine created and connection tested successfully")

except Exception as e:
    engine_error = str(e)
    logger.error(f"❌ Database engine creation/test failed: {e}")
    logger.error(f"   URL format (sanitized): {safe_url}")
    
    # Create a dummy engine to prevent import errors
    # The app will start but show errors in health checks
    logger.warning("⚠️  Creating fallback engine - app will start but DB operations will fail")
    try:
        # Create a minimal engine that won't crash on import
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            echo=False
        )
    except:
        pass

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    Dependency function that yields a database session.
    Automatically closes the session after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection():
    """
    Test database connection.
    Returns (success: bool, message: str)
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            conn.commit()
        return True, "Database connection successful"
    except Exception as e:
        return False, f"Database connection failed: {str(e)}"
