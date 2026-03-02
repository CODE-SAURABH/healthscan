"""HealthScan — AI Engine

The brain of HealthScan. Sends medical report images to AI (Gemini/OpenAI)
and gets back structured analysis with explanations.
"""

import json
import base64
import logging
from pathlib import Path
from typing import Optional
import aiofiles

from app.config import settings
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

# ─── THE PROMPT (This is your moat) ─────────────────────────────────

REPORT_ANALYSIS_PROMPT = """
You are HealthScan, a medical report reading assistant for Indian users.
You help ordinary people understand their blood test / medical reports.

ANALYZE the uploaded medical report image and extract EVERY test parameter.

For EACH test parameter found, provide a JSON object with:
{
  "test_name": "Standard medical name (e.g., Hemoglobin)",
  "test_name_simple": "Simple name anyone understands (e.g., Blood Iron Level)",
  "value": 7.2,
  "unit": "g/dL",
  "reference_range": "12.0 - 16.0",
  "ref_low": 12.0,
  "ref_high": 16.0,
  "status": "low",
  "severity": "red",
  "explanation_en": "Your hemoglobin level is lower than the typical range. Hemoglobin is the protein in your blood that carries oxygen to your body. Low levels can make you feel tired, weak, or short of breath. This is quite common and is often related to iron deficiency or diet. Please consult your doctor for proper evaluation.",
  "explanation_hi": "आपका हीमोग्लोबिन सामान्य सीमा से कम है। हीमोग्लोबिन आपके खून में ऑक्सीजन पहुँचाने वाला प्रोटीन है। कम होने पर थकान, कमज़ोरी या साँस फूलना हो सकता है। यह काफी आम है और अक्सर आयरन की कमी या खानपान से जुड़ा होता है। कृपया अपने डॉक्टर से मिलें।"
}

"status" must be one of: "normal", "low", "high", "critical"
  - "normal": value is within reference range
  - "low": value is below reference range but not dangerous
  - "high": value is above reference range but not dangerous
  - "critical": value is significantly outside range and needs immediate attention

"severity" must be one of: "green", "yellow", "red"
  - "green": normal, nothing to worry about
  - "yellow": slightly outside range, worth monitoring
  - "red": significantly abnormal, should see a doctor soon

Also provide an overall summary:
{
  "overall_severity": "yellow",
  "summary_en": "Overall summary in 2-3 simple English sentences...",
  "summary_hi": "कुल मिलाकर सारांश हिंदी में 2-3 सरल वाक्यों में...",
  "values_normal": 12,
  "values_attention": 2,
  "values_critical": 0,
  "key_concerns": ["Hemoglobin is low", "Vitamin D needs attention"],
  "positive_notes": ["Blood sugar is well controlled", "Liver function is normal"],
  "next_steps": ["Consult your doctor about low hemoglobin", "Consider iron-rich foods"]
}

CRITICAL RULES — READ CAREFULLY:
1. NEVER diagnose. NEVER say "You have [disease]."
2. Use phrases: "This may suggest...", "This could indicate...", "Please consult your doctor for..."
3. Be REASSURING when possible: "This is quite common and usually manageable with proper guidance."
4. Use language a 10th-grade student can understand. No medical jargon without explanation.
5. If a value is UNREADABLE or UNCLEAR, set status to "unclear" and say so honestly.
6. Hindi translations must be natural, not Google Translate quality. Write like a caring doctor would speak.
7. If the image is NOT a medical report, return: {"error": "not_medical_report", "message": "This doesn't appear to be a medical report. Please upload a blood test or lab report."}

RETURN FORMAT — Valid JSON only:
{
  "report_info": {
    "lab_name": "...",
    "patient_name": "...",
    "report_date": "...",
    "report_type": "Blood Test / Thyroid Panel / Lipid Profile / etc."
  },
  "parameters": [ ...array of parameter objects... ],
  "summary": { ...summary object... },
  "disclaimer": "This analysis is for informational purposes only and is NOT medical advice. Always consult a qualified healthcare professional for diagnosis and treatment decisions."
}
"""


async def _encode_image(file_path: str) -> str:
    """Read and base64-encode an image file (async)."""
    async with aiofiles.open(file_path, "rb") as f:
        content = await f.read()
        return base64.standard_b64encode(content).decode("utf-8")


def _get_mime_type(file_path: str) -> str:
    """Determine MIME type from file extension."""
    ext = Path(file_path).suffix.lower()
    mime_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
    }
    return mime_map.get(ext, "image/jpeg")


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(Exception), # Catch API errors
    reraise=True
)
async def analyze_with_gemini(file_path: str) -> dict:
    """Analyze medical report using Google Gemini Vision API."""
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)

    model = genai.GenerativeModel("gemini-flash-latest")

    # Read the image
    image_data = await _encode_image(file_path)
    mime_type = _get_mime_type(file_path)

    response = await model.generate_content_async(
        [
            REPORT_ANALYSIS_PROMPT,
            {"mime_type": mime_type, "data": image_data},
        ],
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )

    # Parse JSON response
    result = json.loads(response.text)
    return result


async def analyze_with_openai(file_path: str) -> dict:
    """Analyze medical report using OpenAI GPT-4 Vision API."""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    image_data = await _encode_image(file_path)
    mime_type = _get_mime_type(file_path)

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": REPORT_ANALYSIS_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{image_data}",
                            "detail": "high",
                        },
                    },
                ],
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
        max_tokens=4096,
    )

    result = json.loads(response.choices[0].message.content)
    return result


async def analyze_report(file_path: str) -> dict:
    """
    Main entry point: analyze a medical report image.
    Routes to the configured AI provider.
    """
    logger.info(f"Analyzing report: {file_path} with provider: {settings.AI_PROVIDER}")

    try:
        if settings.AI_PROVIDER == "gemini":
            result = await analyze_with_gemini(file_path)
        elif settings.AI_PROVIDER == "openai":
            result = await analyze_with_openai(file_path)
        else:
            raise ValueError(f"Unknown AI provider: {settings.AI_PROVIDER}")

        logger.info(f"Analysis complete. Found {len(result.get('parameters', []))} parameters.")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        return {
            "error": "parse_error",
            "message": "Failed to analyze the report. Please try again with a clearer image.",
        }
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        return {
            "error": "analysis_failed",
            "message": f"Analysis failed: {str(e)}. Please check your API key and try again.",
        }
