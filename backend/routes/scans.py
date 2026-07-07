from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Device, Scan, ScanCheck
from routes.auth import get_current_user
from schemas import ScanCreate, ScanOut, ScanSummary

router = APIRouter()


@router.post("/scans", response_model=ScanOut, status_code=201)
def submit_scan(
    payload: ScanCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Receive scan results from the Python agent."""

    if not current_user.org_id:
        raise HTTPException(status_code=403, detail="User is not assigned to an organization")

    device = (
        db.query(Device)
        .filter(
            Device.hostname == payload.device.hostname,
            Device.org_id == current_user.org_id,
        )
        .first()
    )
    if not device:
        device = Device(
            hostname=payload.device.hostname,
            os_type=payload.device.os_type,
            os_version=payload.device.os_version,
            ip_address=payload.device.ip_address,
            org_id=current_user.org_id,
            agent_status="active",
            is_active=True,
            last_seen=datetime.utcnow(),
        )
        db.add(device)
        db.commit()
        db.refresh(device)
    else:
        device.os_type = payload.device.os_type or device.os_type
        device.os_version = payload.device.os_version or device.os_version
        device.ip_address = payload.device.ip_address or device.ip_address
        device.agent_status = "active"
        device.is_active = True
        device.last_seen = datetime.utcnow()

    results = payload.results
    total = len(results)
    passed = sum(1 for r in results if r.status.value == "PASS")
    failed = sum(1 for r in results if r.status.value == "FAIL")
    warnings = sum(1 for r in results if r.status.value == "WARN")
    score = round((passed / total) * 100, 2) if total > 0 else 0.0

    scan = Scan(
        device_id=device.id,
        compliance_score=score,
        score=score,
        total_checks=total,
        passed_checks=passed,
        failed_checks=failed,
        warned_checks=warnings,
        passed=passed,
        failed=failed,
        warnings=warnings,
        status="completed",
    )
    db.add(scan)
    db.flush()

    critical_findings_count = 0
    high_findings_count = 0
    medium_findings_count = 0
    low_findings_count = 0

    for result in results:
        severity = result.severity.value.lower()
        status = result.status.value

        if severity == "critical" and status == "FAIL":
            critical_findings_count += 1
        elif severity == "high" and status == "FAIL":
            high_findings_count += 1
        elif severity == "medium" and status == "FAIL":
            medium_findings_count += 1
        elif severity == "low" and status == "FAIL":
            low_findings_count += 1

        check = ScanCheck(
            scan_id=scan.id,
            check_id=result.check_id,
            title=result.title,
            description=result.description,
            status=status,
            severity=result.severity.value,
            actual_value=result.actual_value,
            expected_value=result.expected_value,
            remediation=result.remediation,
        )
        db.add(check)

    scan.critical_count = critical_findings_count
    scan.high_count = high_findings_count
    scan.medium_count = medium_findings_count
    scan.low_count = low_findings_count

    device.compliance_score = score
    device.critical_findings = critical_findings_count
    device.high_findings = high_findings_count
    device.medium_findings = medium_findings_count
    device.low_findings = low_findings_count
    device.last_scan_timestamp = datetime.utcnow()
    device.last_scan_status = "completed"

    db.commit()
    db.refresh(scan)

    try:
        from services.notification_service import notify_scan_completion

        notify_scan_completion(device.hostname, score, critical_findings_count, {})
    except Exception as exc:
        print(f"Failed to send notifications: {exc}")

    return scan


@router.get("/scans", response_model=List[ScanSummary])
def list_scans(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Scan)
        .join(Device)
        .filter(Device.org_id == current_user.org_id)
        .order_by(Scan.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )



@router.get("/scans/compliance-metrics")
def get_org_compliance_metrics(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _build_org_compliance_metrics(current_user, db)


@router.get("/scans/{scan_id}", response_model=ScanOut)
def get_scan(scan_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    scan = (
        db.query(Scan)
        .join(Device)
        .filter(Scan.id == scan_id, Device.org_id == current_user.org_id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/devices")
def list_devices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    os_type: Optional[str] = None,
    is_active: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Device).filter(Device.org_id == current_user.org_id)
    if os_type:
        query = query.filter(Device.os_type == os_type)
    if is_active not in (None, ""):
        active_filter = is_active.lower()
        if active_filter not in {"true", "false"}:
            raise HTTPException(status_code=400, detail="is_active must be true or false")
        query = query.filter(Device.is_active == (active_filter == "true"))

    devices = query.order_by(Device.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for device in devices:
        last_scan = db.query(Scan).filter(Scan.device_id == device.id).order_by(Scan.created_at.desc()).first()
        result.append({
            "id": device.id,
            "hostname": device.hostname,
            "os_type": device.os_type,
            "os_version": device.os_version,
            "ip_address": device.ip_address,
            "mac_address": device.mac_address,
            "is_active": device.is_active,
            "agent_status": device.agent_status,
            "compliance_score": device.compliance_score,
            "risk_score": device.risk_score,
            "last_score": last_scan.score if last_scan else None,
            "last_scan": last_scan.created_at if last_scan else None,
            "last_scan_status": device.last_scan_status,
            "last_seen": device.last_seen.isoformat() if device.last_seen else None,
        })
    return result


@router.get("/devices/stats")
def device_stats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    devices = db.query(Device).filter(Device.org_id == current_user.org_id).all()
    total_devices = len(devices)
    active_devices = sum(1 for device in devices if device.is_active)
    offline_devices = total_devices - active_devices

    breakdown = {}
    for device in devices:
        breakdown[device.os_type] = breakdown.get(device.os_type, 0) + 1

    return {
        "total_devices": total_devices,
        "active_devices": active_devices,
        "offline_devices": offline_devices,
        "os_breakdown": [{"os_type": os_type, "count": count} for os_type, count in sorted(breakdown.items())],
    }


@router.get("/devices/{device_id}")
def get_device(
    device_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    device = db.query(Device).filter(Device.id == device_id, Device.org_id == current_user.org_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    last_scan = db.query(Scan).filter(Scan.device_id == device.id).order_by(Scan.created_at.desc()).first()
    return {
        "id": device.id,
        "hostname": device.hostname,
        "os_type": device.os_type,
        "os_version": device.os_version,
        "ip_address": device.ip_address,
        "mac_address": device.mac_address,
        "is_active": device.is_active,
        "agent_status": device.agent_status,
        "compliance_score": device.compliance_score,
        "risk_score": device.risk_score,
        "last_seen": device.last_seen.isoformat() if device.last_seen else None,
        "last_scan": last_scan.created_at.isoformat() if last_scan else None,
    }


@router.get("/devices/{device_id}/scans")
def get_device_scans(
    device_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    device = db.query(Device).filter(Device.id == device_id, Device.org_id == current_user.org_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return (
        db.query(Scan)
        .filter(Scan.device_id == device.id)
        .order_by(Scan.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/devices/{device_id}/compliance-trend")
def get_compliance_trend(
    device_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    device = db.query(Device).filter(Device.id == device_id, Device.org_id == current_user.org_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    cutoff = datetime.utcnow() - timedelta(days=days)
    scans = (
        db.query(Scan)
        .filter(Scan.device_id == device.id, Scan.created_at >= cutoff)
        .order_by(Scan.created_at.asc())
        .all()
    )

    return [
        {
            "date": scan.created_at.isoformat() if scan.created_at else None,
            "score": scan.compliance_score if scan.compliance_score is not None else scan.score,
            "passed": scan.passed_checks if scan.passed_checks is not None else scan.passed,
            "failed": scan.failed_checks if scan.failed_checks is not None else scan.failed,
        }
        for scan in scans
    ]


def _build_org_compliance_metrics(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    devices = db.query(Device).filter(Device.org_id == current_user.org_id).all()
    latest_scans = []
    for device in devices:
        scan = db.query(Scan).filter(Scan.device_id == device.id).order_by(Scan.created_at.desc()).first()
        if scan:
            latest_scans.append(scan)

    if not latest_scans:
        return {
            "org_compliance_score": 0.0,
            "passed_checks": 0,
            "failed_checks": 0,
            "critical_findings": 0,
            "high_findings": 0,
            "medium_findings": 0,
            "low_findings": 0,
            "total_devices": len(devices),
            "recent_scans": [],
        }

    total_score = sum((scan.compliance_score if scan.compliance_score is not None else scan.score) for scan in latest_scans)
    passed_checks = sum((scan.passed_checks if scan.passed_checks is not None else scan.passed) for scan in latest_scans)
    failed_checks = sum((scan.failed_checks if scan.failed_checks is not None else scan.failed) for scan in latest_scans)
    critical_findings = sum(scan.critical_count or 0 for scan in latest_scans)
    high_findings = sum(scan.high_count or 0 for scan in latest_scans)
    medium_findings = sum(scan.medium_count or 0 for scan in latest_scans)
    low_findings = sum(scan.low_count or 0 for scan in latest_scans)

    recent_scans = (
        db.query(Scan)
        .join(Device)
        .filter(Device.org_id == current_user.org_id)
        .order_by(Scan.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "org_compliance_score": round(total_score / len(latest_scans), 2),
        "passed_checks": passed_checks,
        "failed_checks": failed_checks,
        "critical_findings": critical_findings,
        "high_findings": high_findings,
        "medium_findings": medium_findings,
        "low_findings": low_findings,
        "total_devices": len(devices),
        "total_scans": len(latest_scans),
        "recent_scans": [
            {
                "id": scan.id,
                "device_id": scan.device_id,
                "score": scan.compliance_score if scan.compliance_score is not None else scan.score,
                "compliance_score": scan.compliance_score if scan.compliance_score is not None else scan.score,
                "passed_checks": scan.passed_checks if scan.passed_checks is not None else scan.passed,
                "failed_checks": scan.failed_checks if scan.failed_checks is not None else scan.failed,
                "scanned_at": scan.created_at.isoformat() if scan.created_at else None,
            }
            for scan in recent_scans
        ],
    }
