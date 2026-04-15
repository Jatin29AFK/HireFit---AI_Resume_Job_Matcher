def dedupe_keep_order(items: list[str]) -> list[str]:
    seen = set()
    result = []

    for item in items:
        normalized = item.strip().lower()
        if normalized and normalized not in seen:
            seen.add(normalized)
            result.append(item)

    return result


def build_tailoring_plan(analysis_result: dict, structured_resume: dict) -> dict:
    jd_requirements = analysis_result.get("jd_requirements", {})
    required_skills = jd_requirements.get("required_skills", [])
    preferred_skills = jd_requirements.get("preferred_skills", [])

    matched_skills = analysis_result.get("matched_skills", [])
    missing_skills = analysis_result.get("missing_skills", [])
    critical_missing_skills = analysis_result.get("critical_missing_skills", [])
    evidence_summary = analysis_result.get("evidence_summary", {})

    strong_evidence = evidence_summary.get("strong_evidence_skills", [])
    medium_evidence = evidence_summary.get("medium_evidence_skills", [])

    target_role_keywords = dedupe_keep_order(
        required_skills + preferred_skills + matched_skills
    )[:15]

    skills_to_emphasize = dedupe_keep_order(
        strong_evidence + medium_evidence + matched_skills
    )[:12]

    unresolved_gaps = dedupe_keep_order(critical_missing_skills + missing_skills)

    sections_to_rewrite = []
    if structured_resume.get("summary"):
        sections_to_rewrite.append("summary")
    if structured_resume.get("experience_bullets"):
        sections_to_rewrite.append("experience")
    if structured_resume.get("project_bullets"):
        sections_to_rewrite.append("projects")
    if structured_resume.get("skills"):
        sections_to_rewrite.append("skills")

    allowed_skill_terms = dedupe_keep_order(analysis_result.get("resume_skills", []))

    return {
        "target_role_keywords": target_role_keywords,
        "skills_to_emphasize": skills_to_emphasize,
        "skills_not_allowed_to_add": unresolved_gaps,
        "allowed_skill_terms": allowed_skill_terms,
        "sections_to_rewrite": sections_to_rewrite,
        "unresolved_gaps": unresolved_gaps,
        "manual_review_notice": (
            "This is a suggested optimized draft. Review and edit it manually. "
            "Do not depend completely on the app. Verify every claim, skill, tool, "
            "experience detail, and achievement before using it."
        ),
        "user_should_review_on_own": True,
    }