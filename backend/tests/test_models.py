"""
test_models.py - Database model tests
"""
import pytest
from models import Organization, User, Device, Scan, PLANS


def test_organization_creation(db_session):
    """Test organization model creation"""
    org = Organization(
        name="Test Company",
        slug="test-company",
        plan="free",
        device_limit=1
    )
    db_session.add(org)
    db_session.commit()
    
    assert org.id is not None
    assert org.name == "Test Company"
    assert org.plan == "free"
    assert org.device_limit == 1


def test_organization_plan_label(db_session):
    """Test plan label retrieval"""
    org = Organization(
        name="Test Company",
        slug="test-company",
        plan="starter",
        device_limit=5
    )
    db_session.add(org)
    db_session.commit()
    
    assert org.get_plan_label() == "Starter"


def test_user_creation(db_session):
    """Test user model creation"""
    user = User(
        email="test@example.com",
        hashed_password="hashed_password_123",
        full_name="Test User",
        role="owner"
    )
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.role == "owner"
    assert user.is_active is True


def test_device_creation(db_session):
    """Test device model creation"""
    org = Organization(name="Test Org", slug="test-org", plan="free")
    db_session.add(org)
    db_session.commit()
    
    device = Device(
        hostname="test-server",
        os_type="windows",
        os_version="Windows Server 2019",
        ip_address="192.168.1.100",
        org_id=org.id,
        compliance_score=85.5
    )
    db_session.add(device)
    db_session.commit()
    
    assert device.id is not None
    assert device.hostname == "test-server"
    assert device.compliance_score == 85.5
    assert device.org_id == org.id


def test_scan_creation(db_session):
    """Test scan model creation"""
    org = Organization(name="Test Org", slug="test-org", plan="free")
    device = Device(hostname="test-device", os_type="linux", org_id=org.id)
    db_session.add_all([org, device])
    db_session.commit()
    
    scan = Scan(
        device_id=device.id,
        compliance_score=92.5,
        total_checks=20,
        passed_checks=18,
        failed_checks=2,
        status="completed"
    )
    db_session.add(scan)
    db_session.commit()
    
    assert scan.id is not None
    assert scan.compliance_score == 92.5
    assert scan.total_checks == 20
    assert scan.status == "completed"


def test_plans_configuration():
    """Test PLANS configuration"""
    assert "free" in PLANS
    assert "starter" in PLANS
    assert "growth" in PLANS
    assert "team" in PLANS
    assert "enterprise" in PLANS
    
    assert PLANS["free"]["device_limit"] == 1
    assert PLANS["starter"]["device_limit"] == 5
    assert PLANS["enterprise"]["device_limit"] == -1
