"""HealthScan — PDF Generator Service"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.units import inch

def generate_report_pdf(report_data: dict, output_path: str, language: str = 'en'):
    """Generate a PDF summary of the medical report analysis."""
    
    doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    story = []

    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#059669"),
        spaceAfter=12,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=20,
        alignment=1
    )

    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.black,
        spaceBefore=15,
        spaceAfter=10,
        borderPadding=5,
    )

    # 1. Header
    story.append(Paragraph("HealthScan Analysis", title_style))
    story.append(Paragraph(f"Generated on {datetime.now().strftime('%d %b %Y, %I:%M %p')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey, spaceBefore=5, spaceAfter=20))

    # 2. Report Info
    info = report_data.get('report_info', {})
    info_text = f"<b>Patient:</b> {info.get('patient_name', 'N/A')} &nbsp;&nbsp;&nbsp; <b>Lab:</b> {info.get('lab_name', 'N/A')} &nbsp;&nbsp;&nbsp; <b>Date:</b> {info.get('report_date', 'N/A')}"
    story.append(Paragraph(info_text, styles['Normal']))
    story.append(Spacer(1, 15))

    # 3. Overall Summary
    summary = report_data.get('summary', {})
    summary_title = "Health Summary" if language == 'en' else "स्वास्थ्य सारांश"
    story.append(Paragraph(summary_title, section_style))
    
    summary_text = summary.get('summary_hi' if language == 'hi' else 'summary_en', '')
    story.append(Paragraph(summary_text, styles['Normal']))
    story.append(Spacer(1, 15))

    # 4. Parameters Table
    story.append(Paragraph("Test Results", section_style))
    
    # Table Header
    data = [['Test Name', 'Value', 'Unit', 'Range', 'Status']]
    if language == 'hi':
        data = [['टेस्ट का नाम', 'वैल्यू', 'यूनिट', 'नॉर्मल रेंज', 'स्थिति']]

    params = report_data.get('parameters', [])
    for p in params:
        name = p.get('test_name_simple' if language == 'en' else 'test_name', p.get('test_name'))
        data.append([
            name,
            str(p.get('value', '')),
            p.get('unit', ''),
            p.get('reference_range', ''),
            p.get('status', '').upper()
        ])

    table = Table(data, colWidths=[2.2*inch, 1.0*inch, 0.8*inch, 1.2*inch, 0.8*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f3f4f6")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    # Coloring status cells
    for i, p in enumerate(params):
        sev = p.get('severity', 'green')
        color = colors.white
        if sev == 'red': color = colors.HexColor("#fee2e2")
        elif sev == 'yellow': color = colors.HexColor("#fef3c7")
        # Change background for the status cell (last column)
        table.setStyle(TableStyle([('BACKGROUND', (-1, i+1), (-1, i+1), color)]))

    story.append(table)
    story.append(Spacer(1, 25))

    # 5. Disclaimer (Important)
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey, spaceBefore=20, spaceAfter=10))
    disclaimer_text = "<b>Medical Disclaimer:</b> HealthScan provides informational analysis only. It does NOT provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional."
    # For Hindi fonts, ReportLab needs extra setup, for Phase 1 we'll stick to English disclaimer or basic glyphs
    story.append(Paragraph(disclaimer_text, ParagraphStyle('Disc', fontSize=8, textColor=colors.grey)))

    doc.build(story)
    return output_path
