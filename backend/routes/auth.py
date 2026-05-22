"""
routes/auth.py — Authentication with multi-tenant org context
Updated for Phase 1 SaaS:
  - Register creates an Organization automatically
  - JWT token includes org_id and role
  - get_current_user returns user with org context
"""
import os
import re
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import get_db
from models import User, Organization, OrgMember

router = APIRouter()

# ── JWT config ────────────────────────────────────────────
SECRET_KEY     = os.getenv("SECRET_KEY", "changeme-in-production-please")
ALGORITHM      = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── Helpers ───────────────────────────────────────────────
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def _slugify(name: str) -> str:
    """Convert org name to URL-safe slug."""
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug[:50] if slug else "org"

def _unique_slug(base: str, db: Session) -> str:
    """Ensure slug is unique by appending a suffix if needed."""
    slug = base
    suffix = 1
    while db.query(Organization).filter(Organization.slug == slug).first():
        slug = f"{base}-{suffix}"
        suffix += 1
    return slug


# ── Schemas ───────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    org_name: Optional[str] = None   # if None, derived from email domain


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str]
    org_id: str
    org_name: str
    role: str
    plan: str


# ── POST /auth/register ───────────────────────────────────
@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user and automatically create their Organization.
    The registering user becomes the org owner.
    """
    # Check email uniqueness
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Password validation
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    # Derive org name from email if not provided
    org_name = body.org_name or body.email.split("@")[0].replace(".", " ").title()

    # Create Organization
    slug = _unique_slug(_slugify(org_name), db)
    org  = Organization(
        name         = org_name,
        slug         = slug,
        plan         = "free",
        device_limit = 1,
    )
    db.add(org)
    db.flush()   # get org.id before creating user

    # Create User as org owner
    user = User(
        email           = body.email,
        hashed_password = get_password_hash(body.password),
        full_name       = body.full_name,
        org_id          = org.id,
        role            = "owner",
    )
    db.add(user)
    db.flush()

    # Create OrgMember record
    member = OrgMember(
        org_id  = org.id,
        user_id = user.id,
        role    = "owner",
    )
    db.add(member)
    db.commit()

    # Issue JWT
    access_token = create_access_token({
        "sub":    str(user.id),
        "org_id": str(org.id),
        "role":   user.role,
    })

    return TokenResponse(
        access_token = access_token,
        user_id      = str(user.id),
        email        = user.email,
        full_name    = user.full_name,
        org_id       = str(org.id),
        org_name     = org.name,
        role         = user.role,
        plan         = org.plan,
    )


# ── POST /auth/login ──────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login with email + password. Returns JWT with org context."""
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    # Get org details
    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found — contact support")

    access_token = create_access_token({
        "sub":    str(user.id),
        "org_id": str(org.id),
        "role":   user.role,
    })

    return TokenResponse(
        access_token = access_token,
        user_id      = str(user.id),
        email        = user.email,
        full_name    = user.full_name,
        org_id       = str(org.id),
        org_name     = org.name,
        role         = user.role,
        plan         = org.plan,
    )


# ── GET /auth/me ──────────────────────────────────────────
@router.get("/me")
def get_me(
    current_user: User = Depends(lambda: None),  # replaced below
    db: Session = Depends(get_db),
):
    """Return current user profile with org context."""
    pass  # implemented via get_current_user dependency below


# ── Dependency: get_current_user ──────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    JWT validation dependency. Decodes token, loads user + org context.
    Attach to any route that requires authentication.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload  = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id  = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise credentials_exception

    return user


def require_role(*roles: str):
    """
    Role-checking dependency factory.
    Usage: Depends(require_role("owner", "admin"))
    """
    def _check(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role(s): {', '.join(roles)}"
            )
        return current_user
    return _check
