import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel, HttpUrl
import httpx

from app.gemini_service import gemini_service
from app.supabase_service import supabase_service
from app.schemas import DiagnosisCreate, DiagnosisResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Diagnosis"])

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/heic",
    "application/octet-stream"  # Some mobile browsers submit this
}

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit


class SampleDiagnoseRequest(BaseModel):
    image_url: str
    hint_category: Optional[str] = None


@router.post("/diagnose", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def diagnose_image(
    file: UploadFile = File(..., description="Uploaded photo of the fault")
):
    """
    Primary Diagnosis Endpoint:
    1. Validates and reads the uploaded image file.
    2. Sends the image to Google Gemini Vision API for strict classification & safety analysis.
    3. Uploads the image to Supabase Storage (or Data URL).
    4. Persists the diagnosis record to Supabase PostgreSQL database.
    5. Returns the structured diagnosis JSON.
    """
    logger.info(f"Received diagnosis upload request: {file.filename} ({file.content_type})")

    # 1. Validate content type
    content_type = file.content_type or "image/jpeg"
    if content_type not in ALLOWED_IMAGE_TYPES and not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{content_type}'. Please upload a valid JPG, PNG, or WebP image."
        )

    # 2. Read and validate file size
    try:
        image_bytes = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded file: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read uploaded image file."
        )

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty."
        )

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image size exceeds 15MB limit ({len(image_bytes) / (1024*1024):.1f}MB)."
        )

    # 3. Analyze image using Gemini Vision API
    try:
        gemini_result = await gemini_service.analyze_image(
            image_bytes=image_bytes,
            mime_type=content_type,
            filename=file.filename
        )
    except Exception as e:
        logger.error(f"Error during Gemini Vision analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Vision diagnostic service failed: {str(e)}"
        )

    # 4. Upload image to Supabase Storage
    try:
        image_url = await supabase_service.upload_image(
            file_bytes=image_bytes,
            filename=file.filename or "upload.jpg",
            content_type=content_type
        )
    except Exception as e:
        logger.warning(f"Storage upload fallback: {e}")
        image_url = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"

    # 5. Persist diagnosis record to Supabase
    try:
        diagnosis_payload = DiagnosisCreate(
            image_url=image_url,
            category=gemini_result.category,
            cause=gemini_result.cause,
            risk_level=gemini_result.risk_level,
            recommended_action=gemini_result.recommended_action,
            is_diy=gemini_result.is_diy,
            professional_required=gemini_result.professional_required,
            safety_warning=gemini_result.safety_warning,
            instructions=gemini_result.instructions
        )
        saved_record = await supabase_service.create_diagnosis(diagnosis_payload)
        logger.info(f"Diagnosis created successfully: ID {saved_record.id}")
        return saved_record

    except Exception as e:
        logger.error(f"Database persistence error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record diagnosis: {str(e)}"
        )


@router.post("/diagnose-sample", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def diagnose_sample_url(request: SampleDiagnoseRequest):
    """
    Demo / Sample Diagnosis Endpoint:
    Allows running diagnoses on pre-configured sample images without manual local file upload.
    Fetches the remote image and processes it through the pipeline.
    """
    logger.info(f"Diagnosing sample from URL: {request.image_url}")

    # Fetch the image bytes from URL
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(request.image_url)
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Could not fetch sample image from {request.image_url}"
                )
            image_bytes = resp.content
            content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to download sample image: {str(e)}"
        )

    # Analyze with Gemini Vision
    filename_hint = request.hint_category or request.image_url.split("/")[-1]
    gemini_result = await gemini_service.analyze_image(
        image_bytes=image_bytes,
        mime_type=content_type,
        filename=filename_hint
    )

    # Persist
    diagnosis_payload = DiagnosisCreate(
        image_url=request.image_url,
        category=gemini_result.category,
        cause=gemini_result.cause,
        risk_level=gemini_result.risk_level,
        recommended_action=gemini_result.recommended_action,
        is_diy=gemini_result.is_diy,
        professional_required=gemini_result.professional_required,
        safety_warning=gemini_result.safety_warning,
        instructions=gemini_result.instructions
    )
    return await supabase_service.create_diagnosis(diagnosis_payload)
