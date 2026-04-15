from app.utils.constants import DOMAIN_SKILL_PACKS, get_domain_label


def detect_domain(text: str) -> dict:
    text_lower = (text or "").lower()

    best_domain = "general"
    best_score = 0
    domain_scores = {}

    for domain_name, pack in DOMAIN_SKILL_PACKS.items():
        score = 0

        for keyword in pack.get("keywords", []):
            if keyword.lower() in text_lower:
                score += 2

        for category_skills in pack.get("categories", {}).values():
            for skill in category_skills:
                if skill.lower() in text_lower:
                    score += 3

        domain_scores[domain_name] = score

        if score > best_score:
            best_score = score
            best_domain = domain_name

    confidence = "low"
    if best_score >= 18:
        confidence = "high"
    elif best_score >= 8:
        confidence = "medium"

    return {
        "domain": best_domain,
        "label": get_domain_label(best_domain),
        "score": best_score,
        "confidence": confidence,
        "all_scores": domain_scores,
    }


def choose_active_domain(resume_domain: dict, jd_domain: dict) -> dict:
    resume_name = resume_domain.get("domain", "general")
    jd_name = jd_domain.get("domain", "general")

    if jd_name != "general" and jd_domain.get("score", 0) >= max(resume_domain.get("score", 0), 1):
        active = jd_domain
    elif resume_name != "general":
        active = resume_domain
    else:
        active = jd_domain if jd_domain.get("score", 0) > 0 else {
            "domain": "general",
            "label": "General",
            "score": 0,
            "confidence": "low",
            "all_scores": {},
        }

    return active


def build_reliability_meta(
    resume_domain: dict,
    jd_domain: dict,
    resume_skills_count: int,
    jd_skills_count: int,
) -> dict:
    same_domain = (
        resume_domain.get("domain") == jd_domain.get("domain")
        and resume_domain.get("domain") != "general"
    )

    low_skill_coverage = jd_skills_count < 3
    low_domain_confidence = (
        resume_domain.get("confidence") == "low"
        or jd_domain.get("confidence") == "low"
    )

    reliability = "high"
    warning = None

    if same_domain and not low_skill_coverage and not low_domain_confidence:
        reliability = "high"
    elif same_domain or not low_skill_coverage:
        reliability = "medium"
        warning = (
            "This analysis appears usable, but domain detection or skill coverage is only moderate. "
            "Review the matched and missing skills carefully."
        )
    else:
        reliability = "limited"
        warning = (
            "This resume or job description appears to belong to a partially supported or weakly detected domain. "
            "Results may be less reliable than for better-supported domains."
        )

    if resume_domain.get("domain") != jd_domain.get("domain"):
        reliability = "limited"
        warning = (
            "The detected resume domain and job-description domain do not align strongly. "
            "This may reduce the reliability of the analysis."
        )

    return {
        "reliability": reliability,
        "warning_message": warning,
        "resume_domain": resume_domain,
        "jd_domain": jd_domain,
    }