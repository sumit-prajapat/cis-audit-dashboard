"""
CIS Audit Dashboard — Professional PDF Report Generator
Uses ReportLab Platypus for structured, multi-page reports
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas
from reportlab.platypus.flowables import Flowable
from io import BytesIO
from datetime import datetime
import math

# ── Color Palette ────────────────────────────────────────────────────────────
BG_DARK    = colors.HexColor('#0a0e1a')
SURFACE    = colors.HexColor('#111827')
CARD       = colors.HexColor('#1a2235')
BORDER     = colors.HexColor('#1e2d45')
ACCENT     = colors.HexColor('#00ff88')
CYAN       = colors.HexColor('#00d4ff')
RED        = colors.HexColor('#ff4566')
YELLOW     = colors.HexColor('#ffc940')
MUTED      = colors.HexColor('#4a6080')
TEXT       = colors.HexColor('#e2e8f0')
WHITE      = colors.white

SEVERITY_COLORS = {
    'critical': colors.HexColor('#ff4566'),
    'high':     colors.HexColor('#ff6b80'),
    'medium':   colors.HexColor('#ffc940'),
    'low':      colors.HexColor('#00ff88'),
    'info':     colors.HexColor('#00d4ff'),
}

STATUS_COLORS = {
    'PASS': colors.HexColor('#00ff88'),
    'FAIL': colors.HexColor('#ff4566'),
    'WARN': colors.HexColor('#ffc940'),
    'SKIP': colors.HexColor('#4a6080'),
}

# ── Score Ring Flowable ───────────────────────────────────────────────────────
class ScoreRing(Flowable):
    """Draws an SVG-style circular compliance score gauge."""

    def __init__(self, score, size=110):
        Flowable.__init__(self)
        self.score = score
        self.size = size
        self.width = size
        self.height = size

    def draw(self):
        c = self.canv
        cx = self.size / 2
        cy = self.size / 2
        r = self.size * 0.38
        lw = self.size * 0.08

        score = min(max(self.score, 0), 100)
        color = ACCENT if score >= 80 else YELLOW if score >= 60 else RED

        # Background circle
        c.setStrokeColor(BORDER)
        c.setLineWidth(lw)
        c.circle(cx, cy, r, stroke=1, fill=0)

        # Score arc
        if score > 0:
            c.setStrokeColor(color)
            c.setLineWidth(lw)
            start_angle = 90
            sweep = -360 * (score / 100)
            end_angle = start_angle + sweep
            c.arc(cx - r, cy - r, cx + r, cy + r,
                  startAng=start_angle, extent=sweep)

        # Score text
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", self.size * 0.18)
        label = f"{int(round(score))}%"
        c.drawCentredString(cx, cy + self.size * 0.04, label)

        # Sub label
        c.setFillColor(MUTED)
        c.setFont("Helvetica", self.size * 0.08)
        c.drawCentredString(cx, cy - self.size * 0.12, "COMPLIANCE")


# ── Page Template ─────────────────────────────────────────────────────────────
def make_page_template(canvas, doc, scan, device):
    """Header and footer drawn on every page."""
    w, h = A4

    # Top bar
    canvas.setFillColor(SURFACE)
    canvas.rect(0, h - 36, w, 36, fill=1, stroke=0)

    # Logo text
    canvas.setFillColor(ACCENT)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(20, h - 22, "CIS AUDIT DASHBOARD")

    # Hostname
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    hostname = device.hostname if device else "Unknown"
    canvas.drawRightString(w - 20, h - 22, f"Device: {hostname}")

    # Footer
    canvas.setFillColor(SURFACE)
    canvas.rect(0, 0, w, 28, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(20, 10, f"Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}  ·  CIS Benchmark Compliance Report")
    canvas.drawRightString(w - 20, 10, f"Page {doc.page}")

    canvas.restoreState()


# ── Style Definitions ─────────────────────────────────────────────────────────
def build_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'ReportTitle',
        fontName='Helvetica-Bold',
        fontSize=28,
        textColor=TEXT,
        alignment=TA_CENTER,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        'ReportSubtitle',
        fontName='Helvetica',
        fontSize=12,
        textColor=MUTED,
        alignment=TA_CENTER,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        'SectionHeader',
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=ACCENT,
        spaceBefore=14,
        spaceAfter=6,
        leftIndent=0,
    ))
    styles.add(ParagraphStyle(
        'CheckTitle',
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=TEXT,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        'CheckBody',
        fontName='Helvetica',
        fontSize=8,
        textColor=MUTED,
        spaceAfter=2,
        leftIndent=10,
    ))
    styles.add(ParagraphStyle(
        'Remediation',
        fontName='Helvetica-Oblique',
        fontSize=8,
        textColor=CYAN,
        spaceAfter=4,
        leftIndent=10,
    ))
    styles.add(ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=MUTED,
    ))
    styles.add(ParagraphStyle(
        'MetaValue',
        fontName='Helvetica',
        fontSize=9,
        textColor=TEXT,
    ))
    return styles


# ── Main Generator ────────────────────────────────────────────────────────────
def generate_pdf_report(scan, device, results) -> bytes:
    """
    Generate a complete CIS compliance PDF report.

    Args:
        scan    : Scan ORM object  (score, total_checks, passed, failed, warnings, scanned_at)
        device  : Device ORM object (hostname, os_type, os_version, ip_address)
        results : list of CheckResult ORM objects

    Returns:
        bytes of the PDF
    """
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=22 * mm,
        bottomMargin=18 * mm,
        title=f"CIS Audit Report — {device.hostname if device else 'Unknown'}",
        author="CIS Audit Dashboard",
    )

    styles = build_styles()
    story  = []
    W = A4[0] - 40 * mm  # usable width

    # ── COVER ──────────────────────────────────────────────────────────────
    story.append(Spacer(1, 18 * mm))

    # Dark cover banner
    banner_data = [[
        Paragraph("CIS BENCHMARK", ParagraphStyle(
            'BannerTop', fontName='Helvetica', fontSize=11,
            textColor=MUTED, alignment=TA_CENTER)),
        '',
    ], [
        Paragraph("Compliance Audit Report", ParagraphStyle(
            'BannerTitle', fontName='Helvetica-Bold', fontSize=22,
            textColor=TEXT, alignment=TA_CENTER)),
        '',
    ]]
    banner = Table([[Paragraph(
        "CIS BENCHMARK<br/><font size=22><b>Compliance Audit Report</b></font>",
        ParagraphStyle('Banner', fontName='Helvetica-Bold', fontSize=11,
                       textColor=TEXT, alignment=TA_CENTER, leading=32)
    )]], colWidths=[W])
    banner.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), SURFACE),
        ('ROUNDEDCORNERS', [8]),
        ('TOPPADDING',    (0, 0), (-1, -1), 18),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 18),
    ]))
    story.append(banner)
    story.append(Spacer(1, 8 * mm))

    # Score ring + meta side by side
    score_ring = ScoreRing(scan.score if scan else 0, size=110)

    score_color = ACCENT if (scan and scan.score >= 80) else \
                  YELLOW if (scan and scan.score >= 60) else RED

    hostname   = device.hostname   if device else 'Unknown'
    os_type    = (device.os_type   if device else 'Unknown').upper()
    os_version = device.os_version if device else 'Unknown'
    ip_address = device.ip_address if device else 'Unknown'
    scan_date  = scan.scanned_at.strftime('%Y-%m-%d %H:%M') if scan else 'Unknown'
    scan_id    = f"#{scan.id}" if scan else 'N/A'

    meta_items = [
        ("Hostname",   hostname),
        ("OS",         f"{os_type} {os_version}"),
        ("IP Address", ip_address),
        ("Scan Date",  scan_date),
        ("Scan ID",    scan_id),
    ]
    meta_para = []
    for label, value in meta_items:
        meta_para.append(Paragraph(
            f'<font color="#4a6080"><b>{label}:</b></font>  '
            f'<font color="#e2e8f0">{value}</font>',
            ParagraphStyle('Meta', fontName='Helvetica', fontSize=9, leading=15,
                           textColor=TEXT)
        ))

    cover_table = Table(
        [[score_ring, meta_para]],
        colWidths=[W * 0.38, W * 0.62],
    )
    cover_table.setStyle(TableStyle([
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND',    (0, 0), (-1, -1), CARD),
        ('ROUNDEDCORNERS',[8]),
        ('TOPPADDING',    (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('LEFTPADDING',   (0, 0), (0, 0),   10),
        ('LEFTPADDING',   (1, 0), (1, 0),   14),
    ]))
    story.append(cover_table)
    story.append(Spacer(1, 6 * mm))

    # ── SUMMARY STATS ──────────────────────────────────────────────────────
    total    = scan.total_checks if scan else 0
    passed   = scan.passed       if scan else 0
    failed   = scan.failed       if scan else 0
    warnings = scan.warnings     if scan else 0

    stats = [
        ("TOTAL CHECKS", str(total),    TEXT),
        ("PASSED",       str(passed),   ACCENT),
        ("FAILED",       str(failed),   RED),
        ("WARNINGS",     str(warnings), YELLOW),
        ("SCORE",        f"{round(scan.score if scan else 0)}%", score_color),
    ]
    stat_cells = []
    for label, value, color in stats:
        stat_cells.append(Table(
            [[Paragraph(value,  ParagraphStyle('SV', fontName='Helvetica-Bold', fontSize=20, textColor=color,   alignment=TA_CENTER))],
             [Paragraph(label,  ParagraphStyle('SL', fontName='Helvetica',      fontSize=7,  textColor=MUTED,   alignment=TA_CENTER))]],
            colWidths=[W / 5]
        ))

    stats_row = Table([stat_cells], colWidths=[W / 5] * 5)
    stats_row.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, -1), SURFACE),
        ('ROUNDEDCORNERS',[6]),
        ('TOPPADDING',    (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LINEAFTER',     (0, 0), (3, 0),   0.5, BORDER),
    ]))
    story.append(stats_row)

    # ── FAILED CHECKS ──────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("❌  Failed Checks", styles['SectionHeader']))
    story.append(HRFlowable(width=W, thickness=0.5, color=BORDER, spaceAfter=6))

    failed_results = [r for r in results if r.status == 'FAIL']
    if failed_results:
        for r in sorted(failed_results, key=lambda x: (
                ['critical','high','medium','low','info'].index(x.severity.lower())
                if x.severity.lower() in ['critical','high','medium','low','info'] else 99)):

            sev_color = SEVERITY_COLORS.get(r.severity.lower(), MUTED)
            sev_bg    = colors.Color(sev_color.red, sev_color.green, sev_color.blue, alpha=0.12)

            check_block = [
                [
                    Paragraph(f'<b>{r.check_id}</b>',
                              ParagraphStyle('CID', fontName='Helvetica-Bold', fontSize=8,
                                             textColor=CYAN)),
                    Paragraph(r.severity.upper(),
                              ParagraphStyle('SEV', fontName='Helvetica-Bold', fontSize=7,
                                             textColor=sev_color, alignment=TA_RIGHT)),
                ],
                [
                    Paragraph(r.title,
                              ParagraphStyle('CT', fontName='Helvetica-Bold', fontSize=9,
                                             textColor=TEXT)),
                    '',
                ],
                [
                    Paragraph(f'<b>Found:</b> {r.actual_value or "N/A"}',
                              ParagraphStyle('CV', fontName='Helvetica', fontSize=8,
                                             textColor=MUTED)),
                    Paragraph(f'<b>Expected:</b> {r.expected_value or "N/A"}',
                              ParagraphStyle('EV', fontName='Helvetica', fontSize=8,
                                             textColor=MUTED, alignment=TA_RIGHT)),
                ],
            ]
            if r.remediation:
                check_block.append([
                    Paragraph(f'💡 {r.remediation}',
                              ParagraphStyle('REM', fontName='Helvetica-Oblique', fontSize=8,
                                             textColor=CYAN)),
                    '',
                ])

            t = Table(check_block, colWidths=[W * 0.7, W * 0.3])
            t.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, -1), CARD),
                ('ROUNDEDCORNERS',[6]),
                ('TOPPADDING',    (0, 0), (-1, -1), 7),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
                ('LEFTPADDING',   (0, 0), (-1, -1), 10),
                ('RIGHTPADDING',  (0, 0), (-1, -1), 10),
                ('SPAN',          (0, 1), (1, 1)),
                ('SPAN',          (0, len(check_block)-1), (1, len(check_block)-1))
                    if r.remediation else ('NOP', (0,0),(0,0)),
                ('LINEABOVE',     (0, 0), (-1, 0),  1.5, sev_color),
                ('VALIGN',        (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(KeepTogether([t, Spacer(1, 3 * mm)]))
    else:
        story.append(Paragraph("No failed checks — excellent!",
                               ParagraphStyle('Good', fontName='Helvetica', fontSize=10,
                                              textColor=ACCENT)))

    # ── WARNINGS ───────────────────────────────────────────────────────────
    warn_results = [r for r in results if r.status == 'WARN']
    if warn_results:
        story.append(Spacer(1, 4 * mm))
        story.append(Paragraph("⚠️  Warnings", styles['SectionHeader']))
        story.append(HRFlowable(width=W, thickness=0.5, color=BORDER, spaceAfter=6))
        for r in warn_results:
            t = Table([[
                Paragraph(f'<b>{r.check_id}</b>  {r.title}',
                          ParagraphStyle('WT', fontName='Helvetica-Bold', fontSize=9, textColor=TEXT)),
                Paragraph(r.actual_value or '',
                          ParagraphStyle('WV', fontName='Helvetica', fontSize=8,
                                         textColor=MUTED, alignment=TA_RIGHT)),
            ]], colWidths=[W * 0.7, W * 0.3])
            t.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, -1), CARD),
                ('TOPPADDING',    (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING',   (0, 0), (-1, -1), 10),
                ('LINEABOVE',     (0, 0), (-1, 0),  1, YELLOW),
            ]))
            story.append(t)
            story.append(Spacer(1, 2 * mm))

    # ── ALL CHECKS TABLE ───────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("📋  Complete Check Results", styles['SectionHeader']))
    story.append(HRFlowable(width=W, thickness=0.5, color=BORDER, spaceAfter=6))

    table_data = [[
        Paragraph("CHECK ID",  ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=7, textColor=MUTED)),
        Paragraph("TITLE",     ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=7, textColor=MUTED)),
        Paragraph("SEVERITY",  ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=7, textColor=MUTED, alignment=TA_CENTER)),
        Paragraph("STATUS",    ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=7, textColor=MUTED, alignment=TA_CENTER)),
    ]]
    row_styles = [
        ('BACKGROUND',    (0, 0), (-1, 0),  SURFACE),
        ('TOPPADDING',    (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING',   (0, 0), (-1, -1), 6),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 6),
        ('GRID',          (0, 0), (-1, -1), 0.3, BORDER),
        ('ROWBACKGROUNDS',(0, 1), (-1, -1), [CARD, SURFACE]),
    ]

    for i, r in enumerate(results):
        sev_c = SEVERITY_COLORS.get(r.severity.lower(), MUTED)
        sta_c = STATUS_COLORS.get(r.status, MUTED)
        table_data.append([
            Paragraph(r.check_id, ParagraphStyle('TD', fontName='Helvetica', fontSize=7, textColor=CYAN)),
            Paragraph(r.title,    ParagraphStyle('TD', fontName='Helvetica', fontSize=7, textColor=TEXT)),
            Paragraph(r.severity.upper(), ParagraphStyle('TD', fontName='Helvetica-Bold', fontSize=7, textColor=sev_c, alignment=TA_CENTER)),
            Paragraph(r.status,   ParagraphStyle('TD', fontName='Helvetica-Bold', fontSize=7, textColor=sta_c, alignment=TA_CENTER)),
        ])

    all_table = Table(table_data, colWidths=[W*0.18, W*0.52, W*0.15, W*0.15])
    all_table.setStyle(TableStyle(row_styles))
    story.append(all_table)

    # ── REMEDIATION SUMMARY ────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("🔧  Remediation Summary", styles['SectionHeader']))
    story.append(HRFlowable(width=W, thickness=0.5, color=BORDER, spaceAfter=6))

    rem_items = [r for r in results if r.status == 'FAIL' and r.remediation]
    if rem_items:
        for r in rem_items:
            story.append(Paragraph(
                f'<b><font color="#00d4ff">{r.check_id}</font></b>  '
                f'<font color="#e2e8f0">{r.title}</font>',
                ParagraphStyle('RI', fontName='Helvetica-Bold', fontSize=9,
                               textColor=TEXT, spaceBefore=6)
            ))
            story.append(Paragraph(
                f'→ {r.remediation}',
                ParagraphStyle('RB', fontName='Helvetica', fontSize=8,
                               textColor=CYAN, leftIndent=12, spaceAfter=2)
            ))
            story.append(HRFlowable(width=W, thickness=0.3, color=BORDER, spaceAfter=2))
    else:
        story.append(Paragraph(
            "No remediation steps required — all checks passed!",
            ParagraphStyle('NoRem', fontName='Helvetica', fontSize=10, textColor=ACCENT)
        ))

    # ── BUILD ──────────────────────────────────────────────────────────────
    def on_page(canvas, doc):
        canvas.saveState()
        make_page_template(canvas, doc, scan, device)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return buf.getvalue()
