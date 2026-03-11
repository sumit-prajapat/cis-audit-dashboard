from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Scan, Device, CheckResult
from pdf_generator import generate_pdf_report
from io import BytesIO

router = APIRouter()


@router.get("/reports/{scan_id}/pdf")
def download_pdf_report(scan_id: int, db: Session = Depends(get_db)):
    """Generate and stream a professional PDF compliance report."""

    # Load scan
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    # Load device
    device = db.query(Device).filter(Device.id == scan.device_id).first()

    # Load check results
    results = db.query(CheckResult).filter(CheckResult.scan_id == scan_id).all()

    # Generate PDF
    try:
        pdf_bytes = generate_pdf_report(scan, device, results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    # Build filename
    hostname = device.hostname if device else "unknown"
    date_str = scan.scanned_at.strftime("%Y%m%d") if scan.scanned_at else "scan"
    filename = f"cis-report-{hostname}-{date_str}.pdf"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        }
    )
