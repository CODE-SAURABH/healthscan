"""HealthScan — Database Models"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, Float, JSON
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Report(Base):
    """Uploaded medical report and its analysis."""

    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(10))  # 'image', 'pdf'
    original_filename = Column(String(255))

    # Analysis results (stored as JSON for flexibility)
    status = Column(String(20), default="processing")  # processing, completed, failed
    analysis_result = Column(JSON, nullable=True)  # Full AI response

    # Report metadata extracted by AI
    lab_name = Column(String(255), nullable=True)
    patient_name = Column(String(255), nullable=True)
    report_date = Column(String(50), nullable=True)
    report_type = Column(String(50), nullable=True)

    # Summary
    overall_severity = Column(String(10), nullable=True)  # green, yellow, red
    values_normal = Column(Integer, default=0)
    values_attention = Column(Integer, default=0)
    values_critical = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    analyzed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Report {self.id} | {self.status} | {self.overall_severity}>"
