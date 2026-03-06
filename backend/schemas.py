from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class SeverityEnum(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    info = "info"


class StatusEnum(str, Enum):
    pass_ = "PASS"
    fail = "FAIL"
    warn = "WARN"
    skip = "SKIP"


# ── Auth ──────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Device ────────────────────────────────────────────────────────────
class DeviceCreate(BaseModel):
    hostname: str
    os_type: str
    os_version: Optional[str] = None
    ip_address: Optional[str] = None


class DeviceOut(DeviceCreate):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Check Result ──────────────────────────────────────────────────────
class CheckResultIn(BaseModel):
    check_id: str
    title: str
    description: Optional[str] = None
    status: StatusEnum
    severity: SeverityEnum
    actual_value: Optional[str] = None
    expected_value: Optional[str] = None
    remediation: Optional[str] = None


class CheckResultOut(CheckResultIn):
    id: int
    scan_id: int

    class Config:
        from_attributes = True


# ── Scan ──────────────────────────────────────────────────────────────
class ScanCreate(BaseModel):
    device: DeviceCreate
    results: List[CheckResultIn]


class ScanOut(BaseModel):
    id: int
    device_id: int
    score: float
    total_checks: int
    passed: int
    failed: int
    warnings: int
    scanned_at: datetime
    results: List[CheckResultOut] = []

    class Config:
        from_attributes = True


class ScanSummary(BaseModel):
    id: int
    device_id: int
    score: float
    total_checks: int
    passed: int
    failed: int
    warnings: int
    scanned_at: datetime

    class Config:
        from_attributes = True
