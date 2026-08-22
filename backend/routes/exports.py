"""
Export Routes - API endpoints for generating and downloading reports
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Scan, Device, Organization
from routes.auth import get_current_user
from services.export_service import ExportService

router = APIRouter()


@router.get("/exports/scans/csv")
def export_scans_csv(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all organization scans as CSV"""
    
    # Get all scans for organization
    scans = (
        db.query(Scan)
        .join(Device)
        .filter(Device.org_id == current_user.org_id)
        .order_by(Scan.created_at.desc())
        .limit(1000)  # Limit to prevent huge files
        .all()
    )
    
    # Format scan data
    scan_data = []
    for scan in scans:
        device = db.query(Device).filter(Device.id == scan.device_id).first()
        scan_data.append({
            'id': str(scan.id),
            'device': {'hostname': device.hostname if device else '', 'os_type': device.os_type if device else ''},
            'created_at': scan.created_at.isoformat() if scan.created_at else '',
            'compliance_score': scan.compliance_score or scan.score or 0,
            'total_checks': scan.total_checks,
            'passed_checks': scan.passed_checks or scan.passed,
            'failed_checks': scan.failed_checks or scan.failed,
            'critical_count': scan.critical_count or 0,
            'high_count': scan.high_count or 0,
            'medium_count': scan.medium_count or 0,
            'low_count': scan.low_count or 0,
            'status': scan.status,
        })
    
    # Generate CSV
    csv_output = ExportService.generate_compliance_report_csv(scan_data)
    
    # Return as downloadable file
    filename = f"scans_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([csv_output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/exports/scans/excel")
def export_scans_excel(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all organization scans as Excel"""
    
    # Get all scans for organization
    scans = (
        db.query(Scan)
        .join(Device)
        .filter(Device.org_id == current_user.org_id)
        .order_by(Scan.created_at.desc())
        .limit(1000)
        .all()
    )
    
    # Format scan data
    scan_data = []
    for scan in scans:
        device = db.query(Device).filter(Device.id == scan.device_id).first()
        scan_data.append({
            'Scan ID': str(scan.id)[:8],
            'Device': device.hostname if device else '',
            'OS Type': device.os_type if device else '',
            'Date': scan.created_at.strftime('%Y-%m-%d %H:%M') if scan.created_at else '',
            'Score': f"{scan.compliance_score or scan.score or 0}%",
            'Total': scan.total_checks,
            'Passed': scan.passed_checks or scan.passed,
            'Failed': scan.failed_checks or scan.failed,
            'Critical': scan.critical_count or 0,
            'High': scan.high_count or 0,
            'Medium': scan.medium_count or 0,
            'Low': scan.low_count or 0,
            'Status': scan.status,
        })
    
    # Generate Excel
    excel_output = ExportService.generate_excel(scan_data, sheet_name="Compliance Scans")
    
    # Return as downloadable file
    filename = f"scans_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        iter([excel_output.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/exports/scan/{scan_id}/pdf")
def export_scan_pdf(
    scan_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export individual scan as PDF report"""
    
    # Get scan with authorization check
    scan = (
        db.query(Scan)
        .join(Device)
        .filter(Scan.id == scan_id, Device.org_id == current_user.org_id)
        .first()
    )
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get device and org info
    device = db.query(Device).filter(Device.id == scan.device_id).first()
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    
    # Format scan data for PDF
    scan_data = {
        'id': str(scan.id),
        'device_hostname': device.hostname if device else 'Unknown',
        'device_os_type': device.os_type if device else 'Unknown',
        'compliance_score': scan.compliance_score or scan.score or 0,
        'total_checks': scan.total_checks,
        'passed_checks': scan.passed_checks or scan.passed,
        'failed_checks': scan.failed_checks or scan.failed,
        'warned_checks': scan.warned_checks or scan.warnings or 0,
        'critical_count': scan.critical_count or 0,
        'high_count': scan.high_count or 0,
        'medium_count': scan.medium_count or 0,
        'low_count': scan.low_count or 0,
        'checks': [
            {
                'check_id': check.check_id,
                'title': check.title,
                'status': check.status,
                'severity': check.severity,
            }
            for check in scan.checks
        ] if hasattr(scan, 'checks') else []
    }
    
    # Generate PDF
    pdf_output = ExportService.generate_scan_report_pdf(
        scan_data,
        org_name=org.name if org else 'Organization'
    )
    
    # Return as downloadable file
    filename = f"scan_report_{scan_id[:8]}_{datetime.now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        iter([pdf_output.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
