from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Device, Report, Scan, ScanCheck
from pdf_generator import generate_pdf_report
from routes.auth import get_current_user

router = APIRouter()


class ReportCreateRequest(BaseModel):
    title: str
    report_type: str
    format: str = "pdf"
    framework: str | None = None
    schedule: str | None = None


def _load_latest_scan_bundle(db: Session, org_id: str):
    scan = (
        db.query(Scan)
        .join(Device)
        .filter(Device.org_id == org_id)
        .order_by(Scan.created_at.desc())
        .first()
    )
    if not scan:
        return None, None, []

    device = db.query(Device).filter(Device.id == scan.device_id, Device.org_id == org_id).first()
    checks = db.query(ScanCheck).filter(ScanCheck.scan_id == scan.id).all()
    return scan, device, checks


def _stream_pdf(scan: Scan, device: Device, checks: list[ScanCheck], filename: str):
    pdf_bytes = generate_pdf_report(scan, device, checks)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )


@router.get("/reports")
def list_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    report_type: str | None = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Report).filter(Report.org_id == current_user.org_id)
    if report_type:
        query = query.filter(Report.report_type == report_type)

    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": report.id,
            "org_id": report.org_id,
            "title": report.title,
            "report_type": report.report_type,
            "framework": report.framework,
            "format": report.format,
            "file_path": report.file_path,
            "file_size": report.file_size,
            "status": report.status,
            "schedule": report.schedule,
            "last_generated_at": report.last_generated_at.isoformat() if report.last_generated_at else None,
            "next_scheduled_at": report.next_scheduled_at.isoformat() if report.next_scheduled_at else None,
            "created_at": report.created_at.isoformat() if report.created_at else None,
            "updated_at": report.updated_at.isoformat() if report.updated_at else None,
        }
        for report in reports
    ]


@router.post("/reports")
def create_report(
    body: ReportCreateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = Report(
        org_id=current_user.org_id,
        created_by=current_user.id,
        title=body.title,
        report_type=body.report_type,
        framework=body.framework,
        format=body.format,
        schedule=body.schedule,
        status="pending",
    )
    db.add(report)
    db.flush()

    scan, device, checks = _load_latest_scan_bundle(db, current_user.org_id)
    if scan and device:
        pdf_bytes = generate_pdf_report(scan, device, checks)
        report.file_size = len(pdf_bytes)
        report.status = "completed"
        report.last_generated_at = datetime.utcnow()
        report.file_path = f"scan://{scan.id}"

    db.commit()
    db.refresh(report)

    return {
        "message": "Report created",
        "report": {
            "id": report.id,
            "title": report.title,
            "report_type": report.report_type,
            "format": report.format,
            "status": report.status,
            "file_size": report.file_size,
            "last_generated_at": report.last_generated_at.isoformat() if report.last_generated_at else None,
        },
    }


@router.get("/reports/{scan_id}/pdf")
def download_pdf_report(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    device = db.query(Device).filter(Device.id == scan.device_id).first()

    if not device or device.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Scan not found")

    results = db.query(ScanCheck).filter(ScanCheck.scan_id == scan_id).all()

    try:
        pdf_bytes = generate_pdf_report(scan, device, results)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}")

    hostname = device.hostname if device else "unknown"
    date_str = scan.created_at.strftime("%Y%m%d") if scan.created_at else "scan"
    filename = f"cis-report-{hostname}-{date_str}.pdf"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )


@router.get("/reports/archive/{report_id}/pdf")
def download_archived_report_pdf(
    report_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    report = db.query(Report).filter(Report.id == report_id, Report.org_id == current_user.org_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    scan = None
    device = None
    checks = []

    if report.file_path and report.file_path.startswith("scan://"):
        scan_id = report.file_path.replace("scan://", "", 1)
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if scan:
            device = db.query(Device).filter(Device.id == scan.device_id, Device.org_id == current_user.org_id).first()
            checks = db.query(ScanCheck).filter(ScanCheck.scan_id == scan.id).all()

    if not scan or not device:
        scan, device, checks = _load_latest_scan_bundle(db, current_user.org_id)

    if not scan or not device:
        raise HTTPException(status_code=404, detail="No scan data available to generate PDF")

    hostname = device.hostname if device else "unknown"
    date_str = report.created_at.strftime("%Y%m%d") if report.created_at else "report"
    filename = f"cis-report-{hostname}-{date_str}.pdf"
    return _stream_pdf(scan, device, checks, filename)