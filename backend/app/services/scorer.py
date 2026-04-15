def get_fit_label(score: float) -> str:
    if score >= 80:
        return "Strong Fit"
    elif score >= 65:
        return "Good Fit"
    elif score >= 45:
        return "Moderate Fit"
    return "Low Fit"


def calculate_section_evidence_score(
    matched_skills: list[str],
    section_skill_map: dict[str, list[str]]
) -> float:
    weights = {
        "skills": 0.25,
        "experience": 0.35,
        "projects": 0.25,
        "summary": 0.10,
        "certifications": 0.05
    }

    if not matched_skills:
        return 0.0

    matched_set = set(matched_skills)
    score = 0.0

    for section, weight in weights.items():
        section_skills = set(section_skill_map.get(section, []))
        overlap = matched_set.intersection(section_skills)
        section_ratio = len(overlap) / len(matched_set) if matched_set else 0.0
        score += weight * section_ratio

    return min(score, 1.0)


def calculate_weighted_skill_score(
    matched_skills: list[str],
    required_skills: list[str],
    preferred_skills: list[str],
    general_skills: list[str]
) -> dict:
    matched_set = set(matched_skills)
    required_set = set(required_skills)
    preferred_set = set(preferred_skills)
    general_set = set(general_skills)

    required_score = len(matched_set.intersection(required_set)) / len(required_set) if required_set else 0.0
    preferred_score = len(matched_set.intersection(preferred_set)) / len(preferred_set) if preferred_set else 0.0
    general_score = len(matched_set.intersection(general_set)) / len(general_set) if general_set else 0.0

    weighted_skill_score = (
        0.55 * required_score +
        0.10 * preferred_score +
        0.35 * general_score
    )

    return {
        "required_skill_score": round(required_score * 100, 2),
        "preferred_skill_score": round(preferred_score * 100, 2),
        "general_skill_score": round(general_score * 100, 2),
        "weighted_skill_score": round(weighted_skill_score * 100, 2),
        "weighted_skill_score_raw": weighted_skill_score
    }


def calculate_match_score(
    matched_skills: list[str],
    semantic_score: float,
    section_skill_map: dict[str, list[str]],
    required_skills: list[str],
    preferred_skills: list[str],
    general_skills: list[str],
    critical_missing_skills: list[str],
    skill_support_score: float
) -> dict:
    weighted_skill = calculate_weighted_skill_score(
        matched_skills=matched_skills,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        general_skills=general_skills
    )

    evidence_score = calculate_section_evidence_score(matched_skills, section_skill_map)
    support_score_raw = skill_support_score / 100.0

    total_priority_skills = len(required_skills) + len(preferred_skills) + len(general_skills)
    raw_penalty = len(critical_missing_skills) / total_priority_skills if total_priority_skills else 0.0

    # cap the impact so a few gaps do not crush the score too much
    effective_penalty = min(raw_penalty, 0.20)

    overall_score = (
        0.42 * weighted_skill["weighted_skill_score_raw"] +
        0.12 * semantic_score +
        0.18 * evidence_score +
        0.18 * support_score_raw -
        0.10 * effective_penalty
    )

    overall_score = max(0.0, min(overall_score, 1.0))
    overall_percent = round(overall_score * 100, 2)

    return {
        "required_skill_score": weighted_skill["required_skill_score"],
        "preferred_skill_score": weighted_skill["preferred_skill_score"],
        "general_skill_score": weighted_skill["general_skill_score"],
        "weighted_skill_score": weighted_skill["weighted_skill_score"],
        "semantic_score": round(semantic_score * 100, 2),
        "section_evidence_score": round(evidence_score * 100, 2),
        "skill_support_score": round(skill_support_score, 2),
        "critical_missing_penalty": round(raw_penalty * 100, 2),
        "overall_score": overall_percent,
        "fit_label": get_fit_label(overall_percent)
    }