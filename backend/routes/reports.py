from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Scan
from pdf_generator import generate_pdf
import io

router = APIRouter()


@router.get("/reports/{scan_id}/pdf")
def download_report(scan_id: int, db: Session = Depends(get_db)):
    """Generate and stream a PDF compliance report for a scan."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    pdf_bytes = generate_pdf(scan)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_scan_{scan_id}.pdf"},
    )
