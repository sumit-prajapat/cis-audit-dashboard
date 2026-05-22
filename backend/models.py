"""
models.py — SQLAlchemy ORM models for CIS Audit SaaS
Phase 1: Added Organization, OrgMember, OrgInvite tables
Existing: User, Device, Scan, ScanCheck remain compatible
"""
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Float,
    ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid


# ── Helpers ───────────────────────────────────────────────
def new_uuid():
    return str(uuid.uuid4())


# ── Plans config (single source of truth) ─────────────────
PLANS = {
    "free":       {"device_limit": 1,   "price_id": None,                    "label": "Free"},
    "starter":    {"device_limit": 5,   "price_id": "price_starter_monthly", "label": "Starter"},
    "growth":     {"device_limit": 20,  "price_id": "price_growth_monthly",  "label": "Growth"},
    "team":       {"device_limit": 50,  "price_id": "price_team_monthly",    "label": "Team"},
    "enterprise": {"device_limit": -1,  "price_id": None,                    "label": "Enterprise"},
}

PLAN_PRICES = {
    "starter":  29,
    "growth":   79,
    "team":     149,
}


# ╔══════════════════════════════════════════════════════════╗
#  Organization — top-level tenant
# ╚══════════════════════════════════════════════════════════╝
class Organization(Base):
    __tablename__ = "organizations"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    name            = Column(String(120), nullable=False)
    slug            = Column(String(60),  unique=True, nullable=False)  # url-safe id

    # Billing
    plan                       = Column(String(20), default="free", nullable=False)
    device_limit               = Column(Integer, default=1)
    stripe_customer_id         = Column(String(80),  nullable=True)
    stripe_subscription_id     = Column(String(80),  nullable=True)
    stripe_subscription_status = Column(String(30),  nullable=True)   # active|trialing|past_due|canceled
    stripe_current_period_end  = Column(DateTime,    nullable=True)

    # Meta
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    members = relationship("OrgMember", back_populates="org", cascade="all, delete-orphan")
    invites = relationship("OrgInvite", back_populates="org", cascade="all, delete-orphan")
    devices = relationship("Device",    back_populates="org", cascade="all, delete-orphan")

    def is_at_device_limit(self) -> bool:
        if self.device_limit == -1:
            return False
        from sqlalchemy.orm import object_session
        session = object_session(self)
        if not session:
            return False
        count = session.query(Device).filter(
            Device.org_id == self.id, Device.is_active == True
        ).count()
        return count >= self.device_limit

    def get_plan_label(self) -> str:
        return PLANS.get(self.plan, {}).get("label", "Free")


# ╔══════════════════════════════════════════════════════════╗
#  User — updated: added org_id FK, role
# ╚══════════════════════════════════════════════════════════╝
class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Org context (set after org creation or invite acceptance)
    org_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=True)
    role   = Column(String(20), default="owner")  # owner | admin | viewer

    # Profile
    full_name  = Column(String(120), nullable=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    org         = relationship("Organization", foreign_keys=[org_id])
    memberships = relationship("OrgMember", back_populates="user", cascade="all, delete-orphan")


# ╔══════════════════════════════════════════════════════════╗
#  OrgMember — junction: user ↔ org with role
# ╚══════════════════════════════════════════════════════════╝
class OrgMember(Base):
    __tablename__ = "org_members"

    id         = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    org_id     = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    user_id    = Column(UUID(as_uuid=False), ForeignKey("users.id"),         nullable=False, index=True)
    role       = Column(String(20), default="viewer")   # owner | admin | viewer
    invited_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    org  = relationship("Organization", back_populates="members")
    user = relationship("User", foreign_keys=[user_id], back_populates="memberships")


# ╔══════════════════════════════════════════════════════════╗
#  OrgInvite — pending email invitations
# ╚══════════════════════════════════════════════════════════╝
class OrgInvite(Base):
    __tablename__ = "org_invites"

    id         = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    org_id     = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    email      = Column(String(255), nullable=False)
    role       = Column(String(20),  default="viewer")
    token      = Column(String(80),  unique=True, nullable=False)   # secure random token
    invited_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    accepted   = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    org = relationship("Organization", back_populates="invites")


# ╔══════════════════════════════════════════════════════════╗
#  Device — updated: added org_id FK
# ╚══════════════════════════════════════════════════════════╝
class Device(Base):
    __tablename__ = "devices"

    id         = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    org_id     = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=True, index=True)
    user_id    = Column(UUID(as_uuid=False), ForeignKey("users.id"),         nullable=True)  # kept for compat
    hostname   = Column(String(255), nullable=False)
    os_type    = Column(String(20),  default="windows")   # windows | linux
    os_version = Column(String(100), nullable=True)
    agent_version = Column(String(20), nullable=True)
    last_seen  = Column(DateTime,  default=datetime.utcnow)
    is_active  = Column(Boolean,   default=True)
    created_at = Column(DateTime,  default=datetime.utcnow)

    # Relationships
    org   = relationship("Organization", back_populates="devices")
    scans = relationship("Scan", back_populates="device", cascade="all, delete-orphan")


# ╔══════════════════════════════════════════════════════════╗
#  Scan — unchanged (already has device_id FK)
# ╚══════════════════════════════════════════════════════════╝
class Scan(Base):
    __tablename__ = "scans"

    id           = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    device_id    = Column(UUID(as_uuid=False), ForeignKey("devices.id"), nullable=False, index=True)
    score        = Column(Float, default=0.0)
    total_checks = Column(Integer, default=0)
    passed       = Column(Integer, default=0)
    failed       = Column(Integer, default=0)
    warnings     = Column(Integer, default=0)
    created_at   = Column(DateTime, default=datetime.utcnow)

    # Relationships
    device = relationship("Device", back_populates="scans")
    checks = relationship("ScanCheck", back_populates="scan", cascade="all, delete-orphan")


# ╔══════════════════════════════════════════════════════════╗
#  ScanCheck — unchanged
# ╚══════════════════════════════════════════════════════════╝
class ScanCheck(Base):
    __tablename__ = "scan_checks"

    id          = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    scan_id     = Column(UUID(as_uuid=False), ForeignKey("scans.id"), nullable=False, index=True)
    check_id    = Column(String(50),  nullable=False)
    title       = Column(String(255), nullable=False)
    description = Column(Text,        nullable=True)
    status      = Column(String(20),  default="unknown")   # pass | fail | warning | unknown
    severity    = Column(String(20),  default="medium")    # critical | high | medium | low
    remediation = Column(Text,        nullable=True)
    actual_value = Column(String(500), nullable=True)
    expected_value = Column(String(500), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scan = relationship("Scan", back_populates="checks")
