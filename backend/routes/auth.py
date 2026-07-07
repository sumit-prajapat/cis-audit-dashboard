"""Authentication routes for CIS Audit Dashboard."""
from __future__ import annotations

import os
import re
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Body, Depends, Form, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import (
    AuditLog,
    AuthSession,
    EmailVerificationToken,
    Organization,
    PasswordResetToken,
    Role,
    Scan,
    TokenBlacklist,
    User,
    OrgMember,
)
from services.auth_service import AuthService

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "changeme-in-production-please")
ALGORITHM = "HS256"
SECURE_COOKIES = os.getenv("COOKIE_SECURE", "false").lower() in {"1", "true", "yes"}
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")
ACCESS_TOKEN_COOKIE = "access_token"
REFRESH_TOKEN_COOKIE = "refresh_token"
CSRF_COOKIE = "csrf_token"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REMEMBER_ME_REFRESH_DAYS = int(os.getenv("REMEMBER_ME_REFRESH_DAYS", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
VERIFICATION_REQUIRED = os.getenv("EMAIL_VERIFICATION_REQUIRED", "false").lower() in {"1", "true", "yes"}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

ROLE_ALIASES = {
    "viewer": "read_only",
    "read-only": "read_only",
    "readonly": "read_only",
}


def get_password_hash(password: str) -> str:
    return AuthService.hash_password(password)


def verify_password(plain: str, hashed: str) -> bool:
    return AuthService.verify_password(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    return AuthService.create_access_token(data, expires_delta=expires_delta)


def create_refresh_token(data: dict, remember_me: bool = False, expires_delta: Optional[timedelta] = None) -> str:
    return AuthService.create_refresh_token(data, remember_me=remember_me, expires_delta=expires_delta)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    org_name: Optional[str] = None
    remember_me: bool = False


class LoginRequest(BaseModel):
    username: EmailStr
    password: str
    remember_me: bool = False


class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    token: str
    password: str


class EmailVerificationRequest(BaseModel):
    token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str]
    org_id: str
    org_name: str
    role: str
    plan: str
    session_id: str
    csrf_token: str
    email_verified: bool = False
    remember_me: bool = False


class SessionOut(BaseModel):
    session_id: str
    created_at: Optional[str]
    last_used_at: Optional[str]
    expires_at: Optional[str]
    remember_me: bool
    revoked: bool
    current: bool = False


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug[:50] if slug else "org"


def _unique_slug(base: str, db: Session) -> str:
    slug = base
    suffix = 1
    while db.query(Organization).filter(Organization.slug == slug).first():
        slug = f"{base}-{suffix}"
        suffix += 1
    return slug


def _normalize_role(role: Optional[str]) -> str:
    if not role:
        return "read_only"
    role = role.strip().lower()
    return ROLE_ALIASES.get(role, role)


def _client_info(request: Request) -> tuple[Optional[str], Optional[str]]:
    return request.client.host if request.client else None, request.headers.get("user-agent")


def _audit(
    db: Session,
    *,
    action: str,
    resource_type: str,
    org_id: Optional[str],
    user_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    status: str = "success",
    error_message: Optional[str] = None,
    request: Optional[Request] = None,
) -> None:
    ip_address = request.client.host if request and request.client else None
    user_agent = request.headers.get("user-agent") if request else None
    if org_id:
        db.add(
            AuditLog(
                org_id=org_id,
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=ip_address,
                user_agent=user_agent,
                status=status,
                error_message=error_message,
            )
        )


def _set_auth_cookies(response: Response, refresh_token: str, csrf_token: str, remember_me: bool = False) -> None:
    refresh_days = REMEMBER_ME_REFRESH_DAYS if remember_me else REFRESH_TOKEN_EXPIRE_DAYS
    response.set_cookie(
        REFRESH_TOKEN_COOKIE,
        refresh_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite=COOKIE_SAMESITE,
        path="/auth",
        max_age=60 * 60 * 24 * refresh_days,
    )
    response.set_cookie(
        CSRF_COOKIE,
        csrf_token,
        httponly=False,
        secure=SECURE_COOKIES,
        samesite=COOKIE_SAMESITE,
        path="/",
        max_age=60 * 60 * 24 * refresh_days,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/auth")
    response.delete_cookie(CSRF_COOKIE, path="/")


def _token_response(
    *,
    user: User,
    org: Organization,
    access_token: str,
    refresh_token: str,
    csrf_token: str,
    session_id: str,
    remember_me: bool,
    response: Response,
) -> TokenResponse:
    _set_auth_cookies(response, refresh_token, csrf_token, remember_me=remember_me)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        org_id=str(org.id),
        org_name=org.name,
        role=_normalize_role(user.role),
        plan=org.plan,
        session_id=session_id,
        csrf_token=csrf_token,
        email_verified=bool(user.email_verified),
        remember_me=remember_me,
    )


def _issue_session_tokens(
    db: Session,
    user: User,
    remember_me: bool,
    request: Optional[Request] = None,
) -> tuple[AuthSession, str, str, str]:
    ip_address, user_agent = _client_info(request) if request else (None, None)
    session, access_token, refresh_token, csrf_token = AuthService.create_auth_session(
        db,
        user,
        remember_me=remember_me,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return session, access_token, refresh_token, csrf_token


def _decode_access_token(token: str, db: Session) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = AuthService.decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    session_id = payload.get("sid")
    token_jti = payload.get("jti")
    if not user_id or not session_id or not token_jti:
        raise credentials_exception

    if AuthService.is_token_blacklisted(db, token_jti):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise credentials_exception

    session = db.query(AuthSession).filter(AuthSession.session_id == session_id).first()
    if not session or session.revoked_at or session.expires_at < datetime.utcnow():
        raise credentials_exception

    if session.user_id != user.id:
        raise credentials_exception

    if user.password_changed_at and payload.get("iat"):
        issued_at = datetime.utcfromtimestamp(payload["iat"])
        if issued_at + timedelta(seconds=1) < user.password_changed_at:
            raise credentials_exception

    return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    return _decode_access_token(token, db)


def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not token:
        return None
    try:
        return _decode_access_token(token, db)
    except HTTPException:
        return None


def _extract_refresh_token(request: Request, body: Optional[RefreshRequest]) -> Optional[str]:
    if body and body.refresh_token:
        return body.refresh_token
    return request.cookies.get(REFRESH_TOKEN_COOKIE)


@router.post("/register", response_model=TokenResponse)
def register(
    body: RegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    is_valid, message = AuthService.validate_password_strength(body.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    org_name = body.org_name.strip() if body.org_name else body.email.split("@")[0].replace(".", " ").title()
    if not org_name:
        raise HTTPException(status_code=400, detail="Organization name is required")

    slug = _slugify(org_name)
    existing_org = db.query(Organization).filter(
        (func.lower(Organization.name) == org_name.lower()) | (Organization.slug == slug)
    ).first()
    if existing_org:
        raise HTTPException(status_code=400, detail="Organization already exists")

    org = Organization(name=org_name, slug=slug, plan="free", device_limit=1)
    db.add(org)
    db.flush()

    user = User(
        email=body.email,
        hashed_password=AuthService.hash_password(body.password),
        full_name=body.full_name,
        org_id=org.id,
        role="owner",
        email_verified=not VERIFICATION_REQUIRED,
        email_verified_at=datetime.utcnow() if not VERIFICATION_REQUIRED else None,
        password_changed_at=datetime.utcnow(),
    )
    db.add(user)
    db.flush()

    db.add(OrgMember(org_id=org.id, user_id=user.id, role="owner"))

    AuthService.create_email_verification_token(db, user)
    _audit(db, action="auth.register", resource_type="user", org_id=org.id, user_id=user.id, request=request)

    session, access_token, refresh_token, csrf_token = _issue_session_tokens(db, user, body.remember_me, request)

    db.commit()
    db.refresh(user)

    response_data = _token_response(
        user=user,
        org=org,
        access_token=access_token,
        refresh_token=refresh_token,
        csrf_token=csrf_token,
        session_id=session.session_id,
        remember_me=body.remember_me,
        response=response,
    )

    if not os.getenv("RESEND_API_KEY"):
        response_data = response_data.model_copy(update={
            "refresh_token": refresh_token,
        })

    return response_data


@router.post("/login", response_model=TokenResponse)
def login(
    username: str = Form(...),
    password: str = Form(...),
    remember_me: bool = Form(False),
    request: Request = None,
    response: Response = None,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is locked due to too many failed login attempts. Please try again later.")

    if not AuthService.verify_password(password, user.hashed_password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= int(os.getenv("MAX_FAILED_LOGIN_ATTEMPTS", "5")):
            user.locked_until = datetime.utcnow() + timedelta(minutes=int(os.getenv("LOCKOUT_MINUTES", "15")))
        db.commit()
        _audit(db, action="auth.login_failed", resource_type="user", org_id=user.org_id, user_id=user.id, request=request, status="failure", error_message="Invalid password")
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    if not user.org_id:
        raise HTTPException(status_code=500, detail="User is not assigned to an organization")

    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found")

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.utcnow()

    session, access_token, refresh_token, csrf_token = _issue_session_tokens(db, user, remember_me, request)
    _audit(db, action="auth.login", resource_type="user", org_id=org.id, user_id=user.id, request=request)
    db.commit()

    return _token_response(
        user=user,
        org=org,
        access_token=access_token,
        refresh_token=refresh_token,
        csrf_token=csrf_token,
        session_id=session.session_id,
        remember_me=remember_me,
        response=response,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(
    request: Request,
    response: Response,
    body: Optional[RefreshRequest] = Body(default=None),
    db: Session = Depends(get_db),
):
    refresh_token = _extract_refresh_token(request, body)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = AuthService.decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise credentials_exception

    refresh_jti = payload.get("jti")
    session_id = payload.get("sid")
    user_id = payload.get("sub")
    if not refresh_jti or not session_id or not user_id:
        raise credentials_exception

    if AuthService.is_token_blacklisted(db, refresh_jti):
        raise credentials_exception

    session = db.query(AuthSession).filter(AuthSession.session_id == session_id).first()
    if not session or session.revoked_at or session.expires_at < datetime.utcnow():
        raise credentials_exception
    if session.refresh_jti != refresh_jti:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active or str(user.id) != str(session.user_id):
        raise credentials_exception

    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found")

    old_refresh_jti = session.refresh_jti
    access_token, new_refresh_token, csrf_token = AuthService.rotate_refresh_session(db, session)
    AuthService.blacklist_token(db, old_refresh_jti, "refresh", session.expires_at, "rotated")
    _audit(db, action="auth.refresh", resource_type="session", org_id=org.id, user_id=user.id, resource_id=session.session_id, request=request)
    db.commit()
    _set_auth_cookies(response, new_refresh_token, csrf_token, remember_me=session.remember_me)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        org_id=str(org.id),
        org_name=org.name,
        role=_normalize_role(user.role),
        plan=org.plan,
        session_id=session.session_id,
        csrf_token=csrf_token,
        email_verified=bool(user.email_verified),
        remember_me=session.remember_me,
    )


def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not token:
        return None
    try:
        return _decode_access_token(token, db)
    except HTTPException:
        return None


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    body: Optional[RefreshRequest] = Body(default=None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    refresh_token = _extract_refresh_token(request, body)
    session = None
    if refresh_token:
        payload = AuthService.decode_token(refresh_token)
        if payload and payload.get("sid"):
            session = db.query(AuthSession).filter(AuthSession.session_id == payload["sid"]).first()

    if current_user and current_user.org_id:
        _audit(db, action="auth.logout", resource_type="user", org_id=current_user.org_id, user_id=current_user.id, request=request)

    if session and not session.revoked_at:
        AuthService.revoke_session(db, session, reason="logout")

    access_token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        access_token = auth_header.split(" ", 1)[1]
        access_payload = AuthService.decode_token(access_token)
        if access_payload and access_payload.get("jti"):
            AuthService.blacklist_token(db, access_payload["jti"], "access", datetime.utcfromtimestamp(access_payload["exp"]), "logout")

    db.commit()
    _clear_auth_cookies(response)
    return {"message": "Logged out"}


@router.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "org_id": str(org.id),
        "org_name": org.name,
        "role": _normalize_role(current_user.role),
        "plan": org.plan,
        "email_verified": bool(current_user.email_verified),
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login_at": current_user.last_login_at.isoformat() if current_user.last_login_at else None,
    }


def require_role(*roles: str):
    normalized_roles = {_normalize_role(role) for role in roles}

    def _check(current_user: User = Depends(get_current_user)):
        if _normalize_role(current_user.role) not in normalized_roles:
            raise HTTPException(status_code=403, detail=f"Access denied. Required role(s): {', '.join(sorted(normalized_roles))}")
        return current_user

    return _check


@router.get("/sessions", response_model=list[SessionOut])
def list_sessions(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = db.query(AuthSession).filter(AuthSession.user_id == current_user.id).order_by(AuthSession.created_at.desc()).all()
    current_session_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        payload = AuthService.decode_token(auth_header.split(" ", 1)[1])
        if payload:
            current_session_id = payload.get("sid")

    return [
        SessionOut(
            session_id=session.session_id,
            created_at=session.created_at.isoformat() if session.created_at else None,
            last_used_at=session.last_used_at.isoformat() if session.last_used_at else None,
            expires_at=session.expires_at.isoformat() if session.expires_at else None,
            remember_me=session.remember_me,
            revoked=bool(session.revoked_at),
            current=current_session_id == session.session_id,
        )
        for session in sessions
    ]


@router.post("/sessions/{session_id}/revoke")
def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(AuthSession).filter(AuthSession.session_id == session_id, AuthSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    AuthService.revoke_session(db, session, reason="manual_revocation")
    db.commit()
    return {"message": "Session revoked"}


@router.post("/logout-all")
def logout_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = db.query(AuthSession).filter(AuthSession.user_id == current_user.id, AuthSession.revoked_at.is_(None)).all()
    for session in sessions:
        AuthService.revoke_session(db, session, reason="logout_all")
    current_user.failed_login_attempts = 0
    current_user.locked_until = None
    db.commit()
    return {"message": "Logged out of all sessions"}


@router.post("/password-reset/request")
def request_password_reset(
    body: PasswordResetRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        return {"message": "If the email exists, a reset link has been sent."}

    token = AuthService.create_password_reset_token(db, user)
    db.commit()
    reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/reset-password/{token}"
    if not os.getenv("RESEND_API_KEY"):
        return {"message": "Reset link generated", "reset_url": reset_url, "reset_token": token}

    _audit(db, action="auth.password_reset_requested", resource_type="user", org_id=user.org_id, user_id=user.id, request=request)
    db.commit()
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/password-reset/confirm")
def confirm_password_reset(
    body: PasswordResetConfirmRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    token_hash = AuthService.hash_token(body.token)
    reset_record = db.query(PasswordResetToken).filter(PasswordResetToken.token_hash == token_hash).first()
    if not reset_record or reset_record.used_at or reset_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == reset_record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_valid, message = AuthService.validate_password_strength(body.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    user.hashed_password = AuthService.hash_password(body.password)
    user.password_changed_at = datetime.utcnow()
    user.failed_login_attempts = 0
    user.locked_until = None
    reset_record.used_at = datetime.utcnow()

    sessions = db.query(AuthSession).filter(AuthSession.user_id == user.id, AuthSession.revoked_at.is_(None)).all()
    for session in sessions:
        AuthService.revoke_session(db, session, reason="password_reset")

    _audit(db, action="auth.password_reset_completed", resource_type="user", org_id=user.org_id, user_id=user.id, request=request)
    db.commit()
    return {"message": "Password reset successful"}


@router.post("/verify-email/request")
def request_email_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = AuthService.create_email_verification_token(db, current_user)
    db.commit()
    verification_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/verify-email/{token}"
    return {"message": "Verification link generated", "verification_url": verification_url, "verification_token": token}


@router.post("/verify-email")
def verify_email(
    body: EmailVerificationRequest,
    db: Session = Depends(get_db),
):
    token_hash = AuthService.hash_token(body.token)
    record = db.query(EmailVerificationToken).filter(EmailVerificationToken.token_hash == token_hash).first()
    if not record or record.verified_at or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.email_verified = True
    user.email_verified_at = datetime.utcnow()
    record.verified_at = datetime.utcnow()
    db.commit()
    return {"message": "Email verified"}
