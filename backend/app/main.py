"""HealthScan — Main FastAPI Application"""

import os
import uuid
import logging
from datetime import datetime, timezone
from pathlib import Path
import aiofiles

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, init_db
from app.models import Report
from app.ai_engine import analyze_report
from app.pdf_generator import generate_report_pdf
from app.medicine_engine import get_medicine_savings

# ─── Logging Setup ─────────────────────────────────────────────

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("healthscan")

# ─── App Setup ─────────────────────────────────────────────────

app = FastAPI(
    title="HealthScan API",
    description="AI-powered medical report analyzer. Upload a blood test report, get simple explanations.",
    version="0.1.0",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (for development)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# ─── Startup ───────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    logger.info("🩺 HealthScan starting up...")
    init_db()
    logger.info("✅ Database initialized")
    logger.info(f"🤖 AI Provider: {settings.AI_PROVIDER}")
    logger.info(f"📁 Upload dir: {settings.UPLOAD_DIR}")
    
    # Check Gemini models availability
    if settings.AI_PROVIDER == "gemini":
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            models = [m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods]
            logger.info(f"🟢 Available Gemini Models: {models}")
        except Exception as e:
            logger.warning(f"🔴 Could not list Gemini models: {e}")


# ─── Health Check ──────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "app": "HealthScan",
        "version": "0.1.0",
        "status": "running",
        "message": "🩺 Upload a medical report to get AI-powered explanations.",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "ai_provider": settings.AI_PROVIDER}


# ─── Upload & Analyze Report ──────────────────────────────────

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
}


@app.post("/api/analyze")
async def upload_and_analyze(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a medical report image/PDF and get AI-powered analysis.

    Returns structured analysis with:
    - Extracted test parameters with explanations
    - Green/Yellow/Red severity indicators
    - Overall health summary
    - Hindi + English explanations
    """

    # ── Validate file ──
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file_ext}' not supported. Please upload JPG, PNG, WebP, or PDF.",
        )

    # Check file size
    contents = await file.read()
    if len(contents) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB.",
        )

    # ── Save file ──
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)

    logger.info(f"📄 File saved: {filename} ({len(contents)} bytes)")

    # ── Create report record ──
    report = Report(
        id=file_id,
        file_path=file_path,
        file_type="pdf" if file_ext == ".pdf" else "image",
        original_filename=file.filename,
        status="processing",
    )
    db.add(report)
    db.commit()

    # ── Analyze with AI ──
    try:
        logger.info(f"🤖 Starting AI analysis for report {file_id}...")
        result = await analyze_report(file_path)

        # Check for errors
        if "error" in result:
            report.status = "failed"
            report.analysis_result = result
            db.commit()
            return JSONResponse(
                status_code=422,
                content={
                    "report_id": file_id,
                    "status": "failed",
                    "error": result.get("error"),
                    "message": result.get("message"),
                },
            )

        # ── Save analysis results ──
        summary = result.get("summary", {})
        report.status = "completed"
        report.analysis_result = result
        report.overall_severity = summary.get("overall_severity", "green")
        report.values_normal = summary.get("values_normal", 0)
        report.values_attention = summary.get("values_attention", 0)
        report.values_critical = summary.get("values_critical", 0)
        report.lab_name = result.get("report_info", {}).get("lab_name")
        report.patient_name = result.get("report_info", {}).get("patient_name")
        report.report_date = result.get("report_info", {}).get("report_date")
        report.report_type = result.get("report_info", {}).get("report_type")
        report.analyzed_at = datetime.now(timezone.utc)
        db.commit()

        logger.info(f"✅ Analysis complete for report {file_id}: {report.overall_severity}")

        return {
            "report_id": file_id,
            "status": "completed",
            "overall_severity": report.overall_severity,
            "report_info": result.get("report_info", {}),
            "parameters": result.get("parameters", []),
            "summary": result.get("summary", {}),
            "savings": get_medicine_savings(result.get("medicines", [])),
            "disclaimer": result.get(
                "disclaimer",
                "This analysis is for informational purposes only and is NOT medical advice. "
                "Always consult a qualified healthcare professional.",
            ),
        }

    except Exception as e:
        logger.error(f"❌ Analysis failed for report {file_id}: {e}")
        report.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Analysis failed. Please try again with a clearer image.",
        )


# ─── Get Report by ID ─────────────────────────────────────────

@app.get("/api/report/{report_id}")
async def get_report(report_id: str, db: Session = Depends(get_db)):
    """Retrieve a previously analyzed report by its ID."""

    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.status == "processing":
        return {"report_id": report_id, "status": "processing"}

    if report.status == "failed":
        return {
            "report_id": report_id,
            "status": "failed",
            "error": report.analysis_result.get("error") if report.analysis_result else "unknown",
        }

    result = report.analysis_result or {}
    return {
        "report_id": report_id,
        "status": "completed",
        "overall_severity": report.overall_severity,
        "report_info": result.get("report_info", {}),
        "parameters": result.get("parameters", []),
        "summary": result.get("summary", {}),
        "disclaimer": result.get(
            "disclaimer",
            "This analysis is for informational purposes only and is NOT medical advice.",
        ),
        "created_at": report.created_at.isoformat() if report.created_at else None,
    }


@app.get("/api/report/{report_id}/pdf")
async def download_report_pdf(
    report_id: str, 
    lang: str = "en",
    db: Session = Depends(get_db)
):
    """Generate and download a PDF summary of the report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not report.analysis_result:
        raise HTTPException(status_code=404, detail="Report not found")

    pdf_filename = f"HealthScan_{report_id}.pdf"
    pdf_path = os.path.join(settings.UPLOAD_DIR, pdf_filename)

    try:
        generate_report_pdf(report.analysis_result, pdf_path, language=lang)
        
        from fastapi.responses import FileResponse
        return FileResponse(
            pdf_path, 
            filename=f"HealthScan_Report_{report.report_date or 'summary'}.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF")


# ─── Run ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
