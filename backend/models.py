"""
models.py — SQLAlchemy ORM models for CIS Audit SaaS
Enhanced with: RBAC, Audit Logging, Compliance Frameworks, Advanced Fields
"""
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Float,
    ForeignKey, Text, Enum as SAEnum, JSON, Index
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
    settings   = Column(JSON, default=dict)
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
    email_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime, nullable=True)
    password_changed_at = Column(DateTime, default=datetime.utcnow)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    org         = relationship("Organization", foreign_keys=[org_id])
    memberships = relationship(
        "OrgMember",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="OrgMember.user_id",
    )


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
#  Authentication Sessions and Token State
# ╚══════════════════════════════════════════════════════════╝
class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    session_id = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    org_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    refresh_jti = Column(String(64), unique=True, nullable=False, index=True)
    csrf_token = Column(String(128), nullable=False)
    remember_me = Column(Boolean, default=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    org = relationship("Organization")


class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    jti = Column(String(64), unique=True, nullable=False, index=True)
    token_type = Column(String(20), nullable=False)  # access | refresh
    reason = Column(String(100), nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(128), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(128), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ╔══════════════════════════════════════════════════════════╗
#  Device — Enhanced with tracking and health metrics
# ╚══════════════════════════════════════════════════════════╝
class Device(Base):
    __tablename__ = "devices"

    id                    = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    device_id             = Column(String(100), unique=True, nullable=True)  # UUID from agent
    org_id                = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=True, index=True)
    user_id               = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)  # Legacy
    
    # Device info
    hostname              = Column(String(255), nullable=False)
    os_type               = Column(String(20), default="windows")  # windows, linux, ubuntu, centos, rhel
    os_version            = Column(String(100), nullable=True)
    ip_address            = Column(String(64), nullable=True)
    mac_address           = Column(String(17), nullable=True)
    
    # Agent info
    agent_version         = Column(String(20), nullable=True)
    agent_status          = Column(String(20), default="pending")  # pending, active, offline, error
    
    # Compliance tracking
    compliance_score      = Column(Float, default=0.0)
    critical_findings     = Column(Integer, default=0)
    high_findings         = Column(Integer, default=0)
    medium_findings       = Column(Integer, default=0)
    low_findings          = Column(Integer, default=0)
    
    # Timestamps
    first_seen            = Column(DateTime, default=datetime.utcnow)
    last_seen             = Column(DateTime, default=datetime.utcnow)
    last_scan_timestamp   = Column(DateTime, nullable=True)
    last_scan_status      = Column(String(20), nullable=True)  # completed, failed, in_progress
    
    # Status
    is_active             = Column(Boolean, default=True)
    is_deleted            = Column(Boolean, default=False)  # Soft delete
    
    # Tags and metadata
    tags                  = Column(JSON, default=list)  # For grouping: ["prod", "critical"]
    metadata_json         = Column("metadata", JSON, default=dict)  # Custom fields
    
    # Risk score
    risk_score            = Column(Float, default=0.0)  # 0-100
    
    created_at            = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at            = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    org   = relationship("Organization", back_populates="devices")
    scans = relationship("Scan", back_populates="device", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_device_org_active', 'org_id', 'is_active'),
        Index('idx_device_last_seen', 'last_seen'),
    )

    @property
    def owner_id(self):
        return self.user_id


# ╔══════════════════════════════════════════════════════════╗
#  Scan — Enhanced with analytics and scoring
# ╚══════════════════════════════════════════════════════════╝
class Scan(Base):
    __tablename__ = "scans"

    id                    = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    device_id             = Column(UUID(as_uuid=False), ForeignKey("devices.id"), nullable=False, index=True)
    scan_timestamp        = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Scoring
    total_checks          = Column(Integer, default=0)
    passed_checks         = Column(Integer, default=0)
    failed_checks         = Column(Integer, default=0)
    warned_checks         = Column(Integer, default=0)
    skipped_checks        = Column(Integer, default=0)
    compliance_score      = Column(Float, default=0.0)  # 0-100
    
    # Legacy fields for compatibility
    score                 = Column(Float, default=0.0)
    passed                = Column(Integer, default=0)
    failed                = Column(Integer, default=0)
    warnings              = Column(Integer, default=0)
    
    # Metadata
    framework             = Column(String(100), nullable=True)  # CIS, NIST, etc
    duration_seconds      = Column(Integer, nullable=True)
    agent_version         = Column(String(20), nullable=True)
    status                = Column(String(20), default="completed")  # completed, failed, in_progress
    error_message         = Column(Text, nullable=True)
    
    # Severity breakdown
    critical_count        = Column(Integer, default=0)
    high_count            = Column(Integer, default=0)
    medium_count          = Column(Integer, default=0)
    low_count             = Column(Integer, default=0)
    
    # Indexing
    created_at            = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    device = relationship("Device", back_populates="scans")
    checks = relationship("ScanCheck", back_populates="scan", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_scan_device_timestamp', 'device_id', 'scan_timestamp'),
        Index('idx_scan_created', 'created_at'),
    )

    @property
    def scanned_at(self):
        return self.created_at

    @property
    def results(self):
        return self.checks


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


# ╔══════════════════════════════════════════════════════════╗
#  RBAC — Role-Based Access Control
# ╚══════════════════════════════════════════════════════════╝
class Role(Base):
    """Predefined roles with permissions"""
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    name = Column(String(50), unique=True, nullable=False)  # admin, analyst, auditor, viewer
    description = Column(String(255), nullable=True)
    is_system = Column(Boolean, default=True)  # Cannot be modified
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")


class Permission(Base):
    """Granular permissions"""
    __tablename__ = "permissions"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    name = Column(String(100), unique=True, nullable=False)  # scan.create, device.read, etc
    description = Column(String(255), nullable=True)
    resource = Column(String(50), nullable=False)  # scan, device, org, user, report
    action = Column(String(20), nullable=False)  # create, read, update, delete, execute
    created_at = Column(DateTime, default=datetime.utcnow)


class RolePermission(Base):
    """Junction: roles ↔ permissions"""
    __tablename__ = "role_permissions"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    role_id = Column(UUID(as_uuid=False), ForeignKey("roles.id"), nullable=False)
    permission_id = Column(UUID(as_uuid=False), ForeignKey("permissions.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission")


# ╔══════════════════════════════════════════════════════════╗
#  Compliance Frameworks
# ╚══════════════════════════════════════════════════════════╝
class ComplianceFramework(Base):
    """Supported compliance frameworks"""
    __tablename__ = "compliance_frameworks"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    name = Column(String(100), unique=True, nullable=False)  # CIS, NIST, ISO27001, PCI-DSS, SOC2, HIPAA
    description = Column(Text, nullable=True)
    version = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    controls = relationship("ComplianceControl", back_populates="framework", cascade="all, delete-orphan")


class ComplianceControl(Base):
    """Compliance control mapping"""
    __tablename__ = "compliance_controls"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    framework_id = Column(UUID(as_uuid=False), ForeignKey("compliance_frameworks.id"), nullable=False)
    control_id = Column(String(100), nullable=False)  # CIS 1.1, NIST AC-2, etc
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    check_ids = Column(JSON, default=list)  # Array of check_id mappings
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    framework = relationship("ComplianceFramework", back_populates="controls")


# ╔══════════════════════════════════════════════════════════╗
#  Audit Logging
# ╚══════════════════════════════════════════════════════════╝
class AuditLog(Base):
    """Track all user actions for compliance"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    org_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # user.login, device.scanned, report.generated
    resource_type = Column(String(50), nullable=False)  # user, device, scan, report
    resource_id = Column(String(255), nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    status = Column(String(20), default="success")  # success, failure
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        Index('idx_audit_org_created', 'org_id', 'created_at'),
        Index('idx_audit_user_created', 'user_id', 'created_at'),
    )


# ╔══════════════════════════════════════════════════════════╗
#  Notifications
# ╚══════════════════════════════════════════════════════════╝
class Notification(Base):
    """In-app and email notifications"""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    org_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # alert, warning, info, success
    trigger = Column(String(100), nullable=False)  # compliance_drop, critical_finding, scan_failed
    related_resource_type = Column(String(50), nullable=True)
    related_resource_id = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        Index('idx_notification_user_read', 'user_id', 'is_read'),
    )


# ╔══════════════════════════════════════════════════════════╗
#  Reports
# ╚══════════════════════════════════════════════════════════╝
class Report(Base):
    """Generated compliance reports"""
    __tablename__ = "reports"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    org_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False)  # executive, technical, compliance
    framework = Column(String(100), nullable=True)  # CIS, NIST, etc
    format = Column(String(20), default="pdf")  # pdf, csv, excel
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)
    status = Column(String(20), default="pending")  # pending, generating, completed, failed
    schedule = Column(String(50), nullable=True)  # daily, weekly, monthly, one-time
    last_generated_at = Column(DateTime, nullable=True)
    next_scheduled_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ╔══════════════════════════════════════════════════════════╗
#  Policies
# ╚══════════════════════════════════════════════════════════╝
class Policy(Base):
    """Security policies and compliance requirements"""
    __tablename__ = "policies"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    org_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    policy_type = Column(String(50), nullable=False)  # security, compliance, operational
    rules = Column(JSON, nullable=False)  # Array of rule definitions
    severity = Column(String(20), default="medium")  # critical, high, medium, low
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
