"""
PDF Report Generator — Phase 4
Generates a branded compliance PDF from a Scan object.
We'll fully build this out in Phase 4. For now it returns a placeholder.
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io


def generate_pdf(scan) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph("CIS Compliance Report", styles["Title"]))
    story.append(Spacer(1, 12))

    # Summary
    story.append(Paragraph(f"Scan ID: {scan.id}", styles["Normal"]))
    story.append(Paragraph(f"Score: {scan.score}%", styles["Normal"]))
    story.append(Paragraph(f"Total Checks: {scan.total_checks}", styles["Normal"]))
    story.append(Paragraph(f"Passed: {scan.passed}  |  Failed: {scan.failed}  |  Warnings: {scan.warnings}", styles["Normal"]))
    story.append(Spacer(1, 20))

    # Check results table
    data = [["Check ID", "Title", "Severity", "Status"]]
    for r in scan.results:
        data.append([r.check_id, r.title[:50], r.severity, r.status])

    table = Table(data, colWidths=[80, 250, 80, 60])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f4f8")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(table)

    doc.build(story)
    return buffer.getvalue()
