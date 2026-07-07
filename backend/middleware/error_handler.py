"""
error_handler.py - Centralized error handling and logging
"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import logging
import traceback
from datetime import datetime

logger = logging.getLogger(__name__)


class APIException(Exception):
    """Custom exception for API errors"""
    
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: dict = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


async def api_exception_handler(request: Request, exc: APIException):
    """Handle custom API exceptions"""
    
    logger.error(
        f"API Error: {exc.code} - {exc.message}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "details": exc.details
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )


async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database exceptions"""
    
    logger.error(
        f"Database Error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc()
        }
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "DATABASE_ERROR",
                "message": "Database operation failed",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    
    logger.error(
        f"Unhandled Exception: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc()
        }
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )


def setup_error_handlers(app: FastAPI):
    """Register error handlers with FastAPI app"""
    app.add_exception_handler(APIException, api_exception_handler)
    app.add_exception_handler(SQLAlchemyError, database_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
