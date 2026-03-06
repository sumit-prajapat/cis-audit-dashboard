from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Device, Scan, CheckResult, StatusEnum
from schemas import ScanCreate, ScanOut, ScanSummary
from typing import List

router = APIRouter()


@router.post("/scans", response_model=ScanOut, status_code=201)
def submit_scan(payload: ScanCreate, db: Session = Depends(get_db)):
    """Receive scan results from the Python agent."""

    # Get or create device
    device = db.query(Device).filter(Device.hostname == payload.device.hostname).first()
    if not device:
        device = Device(**payload.device.model_dump(), owner_id=1)  # default owner for now
        db.add(device)
        db.commit()
        db.refresh(device)

    # Calculate scores
    results = payload.results
    total = len(results)
    passed = sum(1 for r in results if r.status == StatusEnum.pass_)
    failed = sum(1 for r in results if r.status == StatusEnum.fail)
    warnings = sum(1 for r in results if r.status == StatusEnum.warn)
    score = round((passed / total) * 100, 2) if total > 0 else 0.0

    # Save scan
    scan = Scan(
        device_id=device.id,
        score=score,
        total_checks=total,
        passed=passed,
        failed=failed,
        warnings=warnings,
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Save individual check results
    for r in results:
        check = CheckResult(scan_id=scan.id, **r.model_dump())
        db.add(check)
    db.commit()
    db.refresh(scan)

    return scan


@router.get("/scans", response_model=List[ScanSummary])
def list_scans(db: Session = Depends(get_db)):
    """List all scans (summaries, no check details)."""
    return db.query(Scan).order_by(Scan.scanned_at.desc()).all()


@router.get("/scans/{scan_id}", response_model=ScanOut)
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    """Get a single scan with full check-by-check results."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/devices")
def list_devices(db: Session = Depends(get_db)):
    """List all registered devices with their last scan score."""
    devices = db.query(Device).all()
    result = []
    for d in devices:
        last_scan = db.query(Scan).filter(Scan.device_id == d.id).order_by(Scan.scanned_at.desc()).first()
        result.append({
            "id": d.id,
            "hostname": d.hostname,
            "os_type": d.os_type,
            "os_version": d.os_version,
            "ip_address": d.ip_address,
            "last_score": last_scan.score if last_scan else None,
            "last_scan": last_scan.scanned_at if last_scan else None,
        })
    return result
