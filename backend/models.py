from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    devices = relationship("Device", back_populates="owner")


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String, nullable=False)
    os_type = Column(String, nullable=False)
    os_version = Column(String)
    ip_address = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="devices")
    scans = relationship("Scan", back_populates="device")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    score = Column(Float, default=0.0)
    total_checks = Column(Integer, default=0)
    passed = Column(Integer, default=0)
    failed = Column(Integer, default=0)
    warnings = Column(Integer, default=0)
    scanned_at = Column(DateTime(timezone=True), server_default=func.now())

    device = relationship("Device", back_populates="scans")
    results = relationship("CheckResult", back_populates="scan")


class CheckResult(Base):
    __tablename__ = "check_results"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    check_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, nullable=False)       # PASS / FAIL / WARN / SKIP
    severity = Column(String, nullable=False)     # critical / high / medium / low
    actual_value = Column(String)
    expected_value = Column(String)
    remediation = Column(Text)

    scan = relationship("Scan", back_populates="results")
