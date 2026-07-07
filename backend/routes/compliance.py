"""
routes/compliance.py — Compliance Mapping API
Generates mapped scores for NIST, ISO, PCI, SOC2, HIPAA based on raw CIS scan data.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict

from database import get_db
from models import Device, Scan, ScanCheck, Organization
from routes.auth import get_current_user

router = APIRouter()

# ── Mock Mapping Definitions ──────────────────────────────────────────────
# In a full enterprise scenario, these would be in the ComplianceControl table.
FRAMEWORK_MAPPINGS = {
    "NIST CSF": {
        "ID.AM-1": ["WIN-SVC-001", "LNX-SVC-001"],
        "PR.AC-1": ["WIN-ACC-001", "WIN-ACC-002", "WIN-ACC-003", "WIN-ACC-004", "LNX-PWD-001", "LNX-PWD-002"],
        "PR.AC-4": ["WIN-USR-001", "WIN-USR-002", "LNX-SSH-001", "LNX-SSH-003"],
        "PR.PT-4": ["WIN-FW-001", "WIN-FW-002", "WIN-FW-003", "LNX-FW-001", "LNX-FW-002"],
        "PR.DS-5": ["WIN-AV-001", "WIN-UPD-001", "LNX-SYS-002"]
    },
    "ISO 27001": {
        "A.9.2.1": ["WIN-ACC-001", "WIN-ACC-002", "LNX-PWD-001", "LNX-PWD-002"],
        "A.9.2.2": ["WIN-ACC-003", "WIN-ACC-004", "LNX-SSH-002"],
        "A.13.1.1": ["WIN-FW-001", "WIN-FW-002", "WIN-FW-003", "LNX-FW-001", "LNX-FW-002"],
        "A.12.4.1": ["WIN-AUD-001", "WIN-AUD-002"]
    },
    "PCI DSS": {
        "Req 1": ["WIN-FW-001", "WIN-FW-002", "WIN-FW-003", "LNX-FW-001", "LNX-FW-002"],
        "Req 5": ["WIN-AV-001"],
        "Req 8": ["WIN-ACC-001", "WIN-ACC-002", "WIN-ACC-003", "WIN-ACC-004", "LNX-PWD-001", "LNX-PWD-002", "LNX-SSH-002"],
        "Req 10": ["WIN-AUD-001", "WIN-AUD-002"]
    },
    "SOC 2": {
        "CC6.1": ["WIN-ACC-001", "WIN-ACC-002", "WIN-ACC-003", "WIN-ACC-004", "LNX-PWD-001", "LNX-PWD-002"],
        "CC6.6": ["WIN-FW-001", "WIN-FW-002", "WIN-FW-003", "LNX-FW-001", "LNX-FW-002"],
        "CC6.8": ["WIN-AV-001", "LNX-SYS-002"],
        "CC7.2": ["WIN-AUD-001", "WIN-AUD-002"]
    }
}


@router.get("/compliance/scores", response_model=Dict[str, float])
def get_compliance_scores(
    org_id: str = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate high-level compliance scores across different frameworks for the organization.
    """
    target_org_id = org_id or current_user.org_id

    # 1. Get latest scans for all active devices in the org
    subquery = db.query(
        Scan.device_id,
        func.max(Scan.created_at).label("latest_scan_time")
    ).join(Device).filter(
        Device.org_id == target_org_id,
        Device.is_active == True
    ).group_by(Scan.device_id).subquery()

    latest_scans = db.query(Scan).join(
        subquery,
        (Scan.device_id == subquery.c.device_id) &
        (Scan.created_at == subquery.c.latest_scan_time)
    ).all()

    if not latest_scans:
        return {fw: 0.0 for fw in FRAMEWORK_MAPPINGS.keys()}

    scan_ids = [scan.id for scan in latest_scans]

    # 2. Get all checks for these latest scans
    checks = db.query(ScanCheck).filter(ScanCheck.scan_id.in_(scan_ids)).all()

    # Create a quick lookup: check_id -> list of statuses (PASS/FAIL) across the fleet
    check_status_map = {}
    for c in checks:
        if c.check_id not in check_status_map:
            check_status_map[c.check_id] = []
        check_status_map[c.check_id].append(c.status)

    # 3. Calculate scores per framework
    scores = {}
    for fw_name, controls in FRAMEWORK_MAPPINGS.items():
        total_mapped_checks = 0
        total_passed_checks = 0

        for control, mapped_ids in controls.items():
            for m_id in mapped_ids:
                if m_id in check_status_map:
                    total_mapped_checks += len(check_status_map[m_id])
                    total_passed_checks += sum(1 for status in check_status_map[m_id] if status == "PASS")
        
        if total_mapped_checks == 0:
            scores[fw_name] = 0.0
        else:
            scores[fw_name] = round((total_passed_checks / total_mapped_checks) * 100, 2)

    return scores


@router.get("/compliance/{framework}/details")
def get_compliance_framework_details(
    framework: str,
    org_id: str = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed breakdown of a specific framework mapping.
    """
    if framework not in FRAMEWORK_MAPPINGS:
        raise HTTPException(status_code=404, detail="Framework not found")

    target_org_id = org_id or current_user.org_id

    # Get latest scans
    subquery = db.query(
        Scan.device_id,
        func.max(Scan.created_at).label("latest_scan_time")
    ).join(Device).filter(
        Device.org_id == target_org_id,
        Device.is_active == True
    ).group_by(Scan.device_id).subquery()

    latest_scans = db.query(Scan).join(
        subquery,
        (Scan.device_id == subquery.c.device_id) &
        (Scan.created_at == subquery.c.latest_scan_time)
    ).all()

    scan_ids = [scan.id for scan in latest_scans]
    checks = db.query(ScanCheck).filter(ScanCheck.scan_id.in_(scan_ids)).all()

    check_status_map = {}
    for c in checks:
        if c.check_id not in check_status_map:
            check_status_map[c.check_id] = []
        check_status_map[c.check_id].append(c.status)

    mapping = FRAMEWORK_MAPPINGS[framework]
    details = []

    for control, mapped_ids in mapping.items():
        control_passed = 0
        control_total = 0
        for m_id in mapped_ids:
            if m_id in check_status_map:
                control_total += len(check_status_map[m_id])
                control_passed += sum(1 for status in check_status_map[m_id] if status == "PASS")
        
        status = "Non-Compliant"
        score = 0
        if control_total > 0:
            score = (control_passed / control_total) * 100
            if score == 100:
                status = "Compliant"
            elif score >= 50:
                status = "Partial"

        details.append({
            "control": control,
            "mapped_checks": mapped_ids,
            "score": round(score, 2),
            "status": status,
            "passed": control_passed,
            "total": control_total
        })

    return {
        "framework": framework,
        "controls": details
    }
