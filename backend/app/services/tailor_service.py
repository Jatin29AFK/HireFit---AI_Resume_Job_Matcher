from app.services.analyzer import analyze_resume_against_jd, analyze_resume_text_against_jd
from app.services.resume_structurer import structure_resume_for_tailoring
from app.services.tailor_planner import build_tailoring_plan
from app.services.llm.resume_tailor_llm import generate_tailored_resume_draft
from app.services.tailor_validator import validate_tailored_resume_draft


def compose_tailored_resume_text(tailored_resume: dict) -> str:
    parts = []

    if tailored_resume.get("headline"):
        parts.append(tailored_resume["headline"])

    parts.append("Summary")
    parts.append(tailored_resume.get("summary", ""))

    parts.append("Skills")
    parts.append(", ".join(tailored_resume.get("skills", [])))

    parts.append("Experience")
    parts.extend(tailored_resume.get("experience_bullets", []))

    parts.append("Projects")
    parts.extend(tailored_resume.get("project_bullets", []))

    parts.append("Manual Review Note")
    parts.append(tailored_resume.get("manual_review_note", ""))

    return "\n".join(part for part in parts if part)


def build_analysis_snapshot(analysis_result: dict) -> dict:
    return {
        "overall_score": analysis_result["scores"]["overall_score"],
        "fit_label": analysis_result["scores"]["fit_label"],
        "matched_skills": analysis_result["matched_skills"],
        "missing_skills": analysis_result["missing_skills"],
        "critical_missing_skills": analysis_result["critical_missing_skills"],
    }


def generate_optimized_resume_for_jd(
    file_path: str,
    filename: str,
    job_description: str,
) -> dict:
    before_analysis = analyze_resume_against_jd(
        file_path=file_path,
        filename=filename,
        job_description=job_description,
        include_llm_explanation=False,
    )

    structured_resume = structure_resume_for_tailoring(before_analysis)
    tailoring_plan = build_tailoring_plan(before_analysis, structured_resume)

    tailored_resume = generate_tailored_resume_draft(
        structured_resume=structured_resume,
        tailoring_plan=tailoring_plan,
    )

    validation = validate_tailored_resume_draft(
        tailored_resume=tailored_resume,
        tailoring_plan=tailoring_plan,
    )

    tailored_resume_text = compose_tailored_resume_text(tailored_resume)

    after_analysis = analyze_resume_text_against_jd(
        resume_text=tailored_resume_text,
        job_description=job_description,
        filename="tailored_resume.txt",
        include_llm_explanation=False,
    )

    before_score = before_analysis["scores"]["overall_score"]
    after_score = after_analysis["scores"]["overall_score"]

    return {
        "analysis_before": build_analysis_snapshot(before_analysis),
        "tailoring_plan": tailoring_plan,
        "structured_resume": structured_resume,
        "tailored_resume": tailored_resume,
        "validation": validation,
        "analysis_after": build_analysis_snapshot(after_analysis),
        "score_delta": round(after_score - before_score, 2),
        "manual_review_notice": tailoring_plan["manual_review_notice"],
        "user_should_review_on_own": True,
    }