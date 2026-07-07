"""
Authentication and authorization business logic.
"""
from __future__ import annotations

import hashlib
import os
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional, Tuple

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models import (
    AuthSession,
    EmailVerificationToken,
    Organization,
    PasswordResetToken,
    TokenBlacklist,
    User,
)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REMEMBER_ME_REFRESH_DAYS = int(os.getenv("REMEMBER_ME_REFRESH_DAYS", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
MAX_FAILED_LOGIN_ATTEMPTS = int(os.getenv("MAX_FAILED_LOGIN_ATTEMPTS", "5"))
LOCKOUT_MINUTES = int(os.getenv("LOCKOUT_MINUTES", "15"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Handle authentication, JWTs, sessions, and password state."""

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def validate_password_strength(password: str) -> Tuple[bool, str]:
        if len(password) < 12:
            return False, "Password must be at least 12 characters long"
        if not any(char.islower() for char in password):
            return False, "Password must contain a lowercase letter"
        if not any(char.isupper() for char in password):
            return False, "Password must contain an uppercase letter"
        if not any(char.isdigit() for char in password):
            return False, "Password must contain a number"
        if not any(not char.isalnum() for char in password):
            return False, "Password must contain a special character"
        return True, "OK"

    @staticmethod
    def hash_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    @staticmethod
    def generate_token_string() -> str:
        return secrets.token_urlsafe(32)

    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None,
        session_id: Optional[str] = None,
        jti: Optional[str] = None,
    ) -> str:
        payload = data.copy()
        payload.update(
            {
                "type": "access",
                "jti": jti or str(uuid.uuid4()),
                "sid": session_id,
                "exp": datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)),
                "iat": datetime.utcnow(),
            }
        )
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def create_refresh_token(
        data: dict,
        remember_me: bool = False,
        session_id: Optional[str] = None,
        jti: Optional[str] = None,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        payload = data.copy()
        default_days = REMEMBER_ME_REFRESH_DAYS if remember_me else REFRESH_TOKEN_EXPIRE_DAYS
        payload.update(
            {
                "type": "refresh",
                "jti": jti or str(uuid.uuid4()),
                "sid": session_id,
                "exp": datetime.utcnow() + (expires_delta or timedelta(days=default_days)),
                "iat": datetime.utcnow(),
                "remember_me": remember_me,
            }
        )
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        try:
            return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            return None

    @staticmethod
    def create_auth_session(
        db: Session,
        user: User,
        remember_me: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[AuthSession, str, str, str]:
        session_id = str(uuid.uuid4())
        refresh_jti = str(uuid.uuid4())
        csrf_token = secrets.token_urlsafe(24)
        expires_at = datetime.utcnow() + timedelta(days=REMEMBER_ME_REFRESH_DAYS if remember_me else REFRESH_TOKEN_EXPIRE_DAYS)

        session = AuthSession(
            session_id=session_id,
            user_id=user.id,
            org_id=user.org_id,
            refresh_jti=refresh_jti,
            csrf_token=csrf_token,
            remember_me=remember_me,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at,
            last_used_at=datetime.utcnow(),
        )
        db.add(session)
        db.flush()

        access_token = AuthService.create_access_token(
            {"sub": str(user.id), "org_id": str(user.org_id), "role": user.role},
            session_id=session_id,
        )
        refresh_token = AuthService.create_refresh_token(
            {"sub": str(user.id), "org_id": str(user.org_id), "role": user.role},
            remember_me=remember_me,
            session_id=session_id,
            jti=refresh_jti,
            expires_delta=timedelta(days=REMEMBER_ME_REFRESH_DAYS if remember_me else REFRESH_TOKEN_EXPIRE_DAYS),
        )
        return session, access_token, refresh_token, csrf_token

    @staticmethod
    def blacklist_token(db: Session, jti: str, token_type: str, expires_at: datetime, reason: str) -> TokenBlacklist:
        entry = TokenBlacklist(jti=jti, token_type=token_type, reason=reason, expires_at=expires_at)
        db.add(entry)
        return entry

    @staticmethod
    def is_token_blacklisted(db: Session, jti: Optional[str]) -> bool:
        if not jti:
            return False
        entry = db.query(TokenBlacklist).filter(TokenBlacklist.jti == jti).first()
        return entry is not None

    @staticmethod
    def revoke_session(db: Session, session: AuthSession, reason: str = "logout") -> None:
        session.revoked_at = datetime.utcnow()
        if session.refresh_jti:
            AuthService.blacklist_token(db, session.refresh_jti, "refresh", session.expires_at, reason)

    @staticmethod
    def rotate_refresh_session(db: Session, session: AuthSession, remember_me: Optional[bool] = None) -> Tuple[str, str, str]:
        if remember_me is None:
            remember_me = session.remember_me

        new_refresh_jti = str(uuid.uuid4())
        csrf_token = secrets.token_urlsafe(24)
        session.refresh_jti = new_refresh_jti
        session.csrf_token = csrf_token
        session.remember_me = remember_me
        session.last_used_at = datetime.utcnow()
        session.expires_at = datetime.utcnow() + timedelta(days=REMEMBER_ME_REFRESH_DAYS if remember_me else REFRESH_TOKEN_EXPIRE_DAYS)

        access_token = AuthService.create_access_token(
            {"sub": str(session.user_id), "org_id": str(session.org_id), "role": session.user.role},
            session_id=session.session_id,
        )
        refresh_token = AuthService.create_refresh_token(
            {"sub": str(session.user_id), "org_id": str(session.org_id), "role": session.user.role},
            remember_me=remember_me,
            session_id=session.session_id,
            jti=new_refresh_jti,
        )
        return access_token, refresh_token, csrf_token

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.email == email).first()
        if not user or not AuthService.verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_password_reset_token(db: Session, user: User, expires_minutes: int = 30) -> str:
        token = AuthService.generate_token_string()
        db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=AuthService.hash_token(token),
                expires_at=datetime.utcnow() + timedelta(minutes=expires_minutes),
            )
        )
        return token

    @staticmethod
    def create_email_verification_token(db: Session, user: User, expires_hours: int = 24) -> str:
        token = AuthService.generate_token_string()
        db.add(
            EmailVerificationToken(
                user_id=user.id,
                token_hash=AuthService.hash_token(token),
                expires_at=datetime.utcnow() + timedelta(hours=expires_hours),
            )
        )
        return token

    @staticmethod
    def validate_user_org_access(user: User, org_id: str) -> bool:
        if not user.org_id:
            return False
        return str(user.org_id) == str(org_id)
