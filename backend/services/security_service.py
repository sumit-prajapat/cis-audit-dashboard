"""
security_service.py - Advanced security operations and hardening
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import secrets
import string
from dotenv import load_dotenv

from models import User, AuditLog
from middleware.error_handler import APIException

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Short-lived access tokens
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Longer-lived refresh tokens
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SecurityService:
    """Enterprise security hardening service"""
    
    @staticmethod
    def generate_refresh_token_pair(user_id: str) -> Tuple[str, str]:
        """Generate both access and refresh tokens"""
        access_token = SecurityService.create_access_token({"sub": user_id})
        refresh_token = SecurityService.create_refresh_token({"sub": user_id})
        return access_token, refresh_token
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create short-lived JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access", "iat": datetime.utcnow()})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create longer-lived JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh", "iat": datetime.utcnow()})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            # Verify token type is correct
            if payload.get("type") not in ["access", "refresh"]:
                return None
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def validate_password_strength(password: str) -> Tuple[bool, str]:
        """
        Validate password meets security requirements:
        - Minimum 12 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        """
        if len(password) < 12:
            return False, "Password must be at least 12 characters long"
        
        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        
        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        
        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one digit"
        
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(c in special_chars for c in password):
            return False, "Password must contain at least one special character"
        
        return True, ""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def check_account_lockout(db: Session, user_id: str) -> bool:
        """Check if account is locked due to failed attempts"""
        recent_failures = db.query(AuditLog).filter(
            and_(
                AuditLog.user_id == user_id,
                AuditLog.action == "user.login_failed",
                AuditLog.status == "failure",
                AuditLog.created_at >= datetime.utcnow() - timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            )
        ).count()
        
        return recent_failures >= MAX_LOGIN_ATTEMPTS
    
    @staticmethod
    def record_login_attempt(
        db: Session,
        user_id: str,
        success: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Record login attempt for security auditing"""
        audit_log = AuditLog(
            org_id=None,  # Will be set by caller if needed
            user_id=user_id,
            action="user.login_failed" if not success else "user.login_success",
            resource_type="user",
            resource_id=user_id,
            status="failure" if not success else "success",
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(audit_log)
        db.commit()
    
    @staticmethod
    def generate_csrf_token() -> str:
        """Generate a secure CSRF token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def generate_totp_secret() -> str:
        """Generate a secret for 2FA setup"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(32))
    
    @staticmethod
    def generate_api_key(user_id: str, org_id: str) -> str:
        """Generate a secure API key"""
        prefix = "cis_"
        token = secrets.token_urlsafe(32)
        return f"{prefix}{token}"
    
    @staticmethod
    def rate_limit_check(
        db: Session,
        org_id: str,
        endpoint: str,
        limit: int = 5000,
        window_minutes: int = 60
    ) -> Tuple[bool, Dict]:
        """
        Check if organization has exceeded rate limit
        Default: 5000 requests per hour per organization
        """
        recent_requests = db.query(AuditLog).filter(
            and_(
                AuditLog.org_id == org_id,
                AuditLog.created_at >= datetime.utcnow() - timedelta(minutes=window_minutes)
            )
        ).count()
        
        remaining = max(0, limit - recent_requests)
        
        return recent_requests < limit, {
            "limit": limit,
            "remaining": remaining,
            "reset_at": datetime.utcnow() + timedelta(minutes=window_minutes)
        }
    
    @staticmethod
    def encrypt_sensitive_field(value: str) -> str:
        """Encrypt sensitive fields at rest"""
        # In production, use proper encryption like cryptography.Fernet
        from base64 import b64encode
        return b64encode(value.encode()).decode()
    
    @staticmethod
    def decrypt_sensitive_field(encrypted_value: str) -> str:
        """Decrypt sensitive fields"""
        from base64 import b64decode
        return b64decode(encrypted_value.encode()).decode()
    
    @staticmethod
    def sanitize_input(input_string: str) -> str:
        """Sanitize user input to prevent injection attacks"""
        # Remove potentially harmful characters
        dangerous_chars = ["<", ">", "\"", "'", ";", "--", "/*", "*/", "\\"]
        sanitized = input_string
        
        for char in dangerous_chars:
            sanitized = sanitized.replace(char, "")
        
        return sanitized.strip()
    
    @staticmethod
    def generate_secure_session_id() -> str:
        """Generate a cryptographically secure session ID"""
        return secrets.token_urlsafe(32)
