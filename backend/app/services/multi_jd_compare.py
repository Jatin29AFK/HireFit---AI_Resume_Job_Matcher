from app.services.analyzer import analyze_resume_text_against_jd
from app.services.parser import extract_resume_text


def infer_jd_title(job_description: str, analysis_result: dict, index: int) -> str:
    lines = [line.strip() for line in job_description.splitlines() if line.strip()]
    if lines:
        first = lines[0]
        if len(first) <= 100:
            return first

    required_skills = analysis_result.get("jd_requirements", {}).get("required_skills", [])
    if required_skills:
        return f"JD {index}: " + ", ".join(required_skills[:3])

    return f"JD {index}"


def compare_resume_against_multiple_jds(
    file_path: str,
    filename: str,
    job_descriptions: list[str],
) -> dict:
    resume_text = extract_resume_text(file_path, filename)

    comparisons = []
    for index, jd in enumerate(job_descriptions, start=1):
        analysis = analyze_resume_text_against_jd(
            resume_text=resume_text,
            job_description=jd,
            filename=filename,
            include_llm_explanation=False,
        )

        comparisons.append(
            {
                "jd_index": index,
                "jd_title": infer_jd_title(jd, analysis, index),
                "overall_score": analysis["scores"]["overall_score"],
                "fit_label": analysis["scores"]["fit_label"],
                "required_skill_score": analysis["scores"]["required_skill_score"],
                "skill_support_score": analysis["scores"]["skill_support_score"],
                "critical_missing_skills": analysis["critical_missing_skills"],
                "matched_skills": analysis["matched_skills"][:8],
            }
        )

    comparisons.sort(key=lambda item: item["overall_score"], reverse=True)

    return {
        "resume_filename": filename,
        "comparisons": comparisons,
        "best_match": comparisons[0] if comparisons else None,
    }