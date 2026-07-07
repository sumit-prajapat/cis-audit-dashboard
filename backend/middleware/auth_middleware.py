"""
auth_middleware.py - JWT authentication and authorization middleware
"""
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional
import os
from dotenv import load_dotenv

from services.auth_service import AuthService
from models import User

load_dotenv()

security = HTTPBearer()


async def get_current_user(
    request: Request,
    db: Session,
) -> User:
    """Extract and validate JWT token from request, return current user"""
    
    # Get token from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split(" ")[1]
    
    # Decode token
    payload = AuthService.decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain user ID",
        )
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    return user


async def validate_org_access(
    user: User,
    org_id: str
) -> bool:
    """Validate user has access to organization"""
    if not AuthService.validate_user_org_access(user, org_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this organization"
        )
    return True


async def validate_admin_access(
    user: User,
    org_id: Optional[str] = None
) -> bool:
    """Validate user is admin of organization"""
    if user.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if org_id and not AuthService.validate_user_org_access(user, org_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this organization"
        )
    
    return True


def extract_token(request: Request) -> Optional[str]:
    """Extract JWT token from request header"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ")[1]
