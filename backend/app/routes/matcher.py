import os
import uuid
import json
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.models.schemas import MatchAnalysisResponse, ResumeTailorResponse, MultiJDCompareResponse
from app.services.analyzer import analyze_resume_against_jd
from app.services.tailor_service import generate_optimized_resume_for_jd
from app.services.multi_jd_compare import compare_resume_against_multiple_jds
from app.services.jd_guardrails import validate_job_description_input
from app.services.visitor_counter import register_visit, get_visitor_count
from app.services.jd_url_extractor import extract_job_description_from_url

router = APIRouter(prefix="/matcher", tags=["Matcher"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class JobUrlRequest(BaseModel):
    url: str


@router.get("/visitor-count")
def read_visitor_count():
    try:
        count = get_visitor_count()
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read visitor count: {str(e)}")


@router.post("/visitor-count/increment")
def increment_visitor_count():
    try:
        count = register_visit()
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update visitor count: {str(e)}")


@router.post("/extract-jd-from-url")
def extract_jd_from_url(payload: JobUrlRequest):
    try:
        if not payload.url or not payload.url.strip():
            raise HTTPException(status_code=400, detail="URL is required.")

        extracted = extract_job_description_from_url(payload.url.strip())
        validated = validate_job_description_input(extracted)

        return {
            "url": payload.url.strip(),
            "job_description": validated,
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract JD from URL: {str(e)}")


@router.post("/tailor-resume", response_model=ResumeTailorResponse)
async def tailor_resume_for_job(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        if not resume.filename:
            raise HTTPException(status_code=400, detail="Resume file must have a valid filename.")

        allowed_extensions = (".pdf", ".docx")
        if not resume.filename.lower().endswith(allowed_extensions):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

        safe_filename = f"{uuid.uuid4()}_{resume.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as f:
            content = await resume.read()
            f.write(content)

        validated_jd = validate_job_description_input(job_description)

        result = generate_optimized_resume_for_jd(
            file_path=file_path,
            filename=resume.filename,
            job_description=validated_jd,
        )

        return result

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/upload", response_model=MatchAnalysisResponse)
async def upload_resume_and_jd(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        if not resume.filename:
            raise HTTPException(status_code=400, detail="Resume file must have a valid filename.")

        allowed_extensions = (".pdf", ".docx")
        if not resume.filename.lower().endswith(allowed_extensions):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

        safe_filename = f"{uuid.uuid4()}_{resume.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as f:
            content = await resume.read()
            f.write(content)

        validated_jd = validate_job_description_input(job_description)

        result = analyze_resume_against_jd(
            file_path=file_path,
            filename=resume.filename,
            job_description=validated_jd
        )

        return result

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/compare-jds", response_model=MultiJDCompareResponse)
async def compare_resume_with_multiple_jds(
    resume: UploadFile = File(...),
    job_descriptions_json: str = Form(...)
):
    try:
        if not resume.filename:
            raise HTTPException(
                status_code=400,
                detail="Resume file must have a valid filename."
            )

        allowed_extensions = (".pdf", ".docx")
        if not resume.filename.lower().endswith(allowed_extensions):
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are supported."
            )

        try:
            job_descriptions = json.loads(job_descriptions_json)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="job_descriptions_json must be a valid JSON array of job descriptions."
            )

        if not isinstance(job_descriptions, list) or len(job_descriptions) == 0:
            raise HTTPException(
                status_code=400,
                detail="Please provide at least one job description."
            )

        validated_job_descriptions = []
        for index, jd in enumerate(job_descriptions, start=1):
            try:
                validated_jd = validate_job_description_input(jd)
                validated_job_descriptions.append(validated_jd)
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"JD {index}: {str(e)}"
                )

        safe_filename = f"{uuid.uuid4()}_{resume.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as f:
            content = await resume.read()
            f.write(content)

        result = compare_resume_against_multiple_jds(
            file_path=file_path,
            filename=resume.filename,
            job_descriptions=validated_job_descriptions,
        )

        return result

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )