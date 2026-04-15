from app.services.extractor import normalize_skill


def combine_tailored_text(tailored_resume: dict) -> str:
    parts = [
        tailored_resume.get("headline", ""),
        tailored_resume.get("summary", ""),
        " ".join(tailored_resume.get("skills", [])),
        " ".join(tailored_resume.get("experience_bullets", [])),
        " ".join(tailored_resume.get("project_bullets", [])),
    ]
    return " ".join(part for part in parts if part).lower()


def validate_tailored_resume_draft(
    tailored_resume: dict,
    tailoring_plan: dict,
) -> dict:
    allowed_skill_terms = {
        normalize_skill(skill) for skill in tailoring_plan.get("allowed_skill_terms", [])
    }

    unresolved_gaps = {
        normalize_skill(skill) for skill in tailoring_plan.get("unresolved_gaps", [])
    }

    tailored_skills = {
        normalize_skill(skill) for skill in tailored_resume.get("skills", [])
    }

    unsupported_added_skills = sorted(
        skill for skill in tailored_skills if skill and skill not in allowed_skill_terms
    )

    combined_text = combine_tailored_text(tailored_resume)

    falsely_claimed_missing_skills = sorted(
        skill for skill in unresolved_gaps
        if skill
        and skill not in allowed_skill_terms
        and skill in combined_text
    )

    unsupported_added_terms = sorted(set(unsupported_added_skills + falsely_claimed_missing_skills))

    safe_to_export = len(unsupported_added_terms) == 0

    validator_notes = [
        "Review every rewritten line manually before using the resume.",
        "Do not depend completely on the app for final resume quality or truthfulness.",
    ]

    if unsupported_added_terms:
        validator_notes.append(
            "Some unsupported or unresolved terms appeared in the tailored draft and should be edited manually."
        )

    return {
        "unsupported_added_terms": unsupported_added_terms,
        "safe_to_export": safe_to_export,
        "manual_review_required": True,
        "manual_review_notice": tailoring_plan.get("manual_review_notice", ""),
        "validator_notes": validator_notes,
    }