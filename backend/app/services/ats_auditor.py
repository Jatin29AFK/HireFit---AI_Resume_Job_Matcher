import re


def make_issue(title: str, severity: str, details: str, recommendation: str) -> dict:
    return {
        "title": title,
        "severity": severity,
        "details": details,
        "recommendation": recommendation,
    }


def has_quantified_bullet(bullets: list[str]) -> bool:
    pattern = r"(\d+%|\d+\+|\d+\s*(ms|sec|seconds|minutes|users|projects|models|apis|pipelines|clients))"
    return any(re.search(pattern, bullet.lower()) for bullet in bullets)


def build_ats_audit(structured_resume: dict) -> dict:
    issues = []
    quick_fixes = []
    score = 100

    full_name = structured_resume.get("full_name", "")
    email = structured_resume.get("email", "")
    phone = structured_resume.get("phone", "")
    summary = structured_resume.get("summary", "")
    skills = structured_resume.get("skills", [])
    experience_bullets = structured_resume.get("experience_bullets", [])
    project_bullets = structured_resume.get("project_bullets", [])
    linkedin = structured_resume.get("linkedin", "")
    github = structured_resume.get("github", "")

    if not full_name:
        score -= 12
        issues.append(
            make_issue(
                "Missing name",
                "high",
                "The resume header does not clearly expose the candidate name.",
                "Place your full name clearly at the top of the resume.",
            )
        )

    if not email:
        score -= 10
        issues.append(
            make_issue(
                "Missing email",
                "high",
                "Recruiters may not be able to contact you quickly.",
                "Add a professional email address near the top of the resume.",
            )
        )

    if not phone:
        score -= 10
        issues.append(
            make_issue(
                "Missing phone number",
                "high",
                "A phone number is typically expected in resume contact details.",
                "Add a phone number in the header section.",
            )
        )

    if not summary:
        score -= 8
        issues.append(
            make_issue(
                "Missing professional summary",
                "medium",
                "The resume lacks a concise role-aligned summary.",
                "Add a short summary tailored to the target job.",
            )
        )

    if not skills:
        score -= 12
        issues.append(
            make_issue(
                "Missing skills section",
                "high",
                "ATS systems often rely on explicit skills sections.",
                "Add a dedicated skills section with relevant tools and technologies.",
            )
        )

    if len(experience_bullets) < 2:
        score -= 10
        issues.append(
            make_issue(
                "Weak experience section",
                "high",
                "The experience section has too few bullets to prove impact.",
                "Add more achievement-focused experience bullets.",
            )
        )

    if len(project_bullets) < 2:
        score -= 6
        issues.append(
            make_issue(
                "Weak project section",
                "medium",
                "The project section may not show enough depth.",
                "Add stronger project bullets with tools, actions, and outcomes.",
            )
        )

    long_bullets = [
        bullet for bullet in (experience_bullets + project_bullets)
        if len(bullet) > 220
    ]
    if long_bullets:
        score -= 6
        issues.append(
            make_issue(
                "Overlong bullets",
                "medium",
                "Some bullets are too long and may reduce readability.",
                "Shorten bullets and make each one focused on one impact story.",
            )
        )

    if summary and len(summary) > 500:
        score -= 5
        issues.append(
            make_issue(
                "Summary too long",
                "low",
                "A long summary may reduce clarity for recruiters.",
                "Keep the summary concise and target-role focused.",
            )
        )

    if not has_quantified_bullet(experience_bullets + project_bullets):
        score -= 8
        issues.append(
            make_issue(
                "Missing quantified impact",
                "medium",
                "The resume does not clearly show measurable results.",
                "Add numbers, percentages, scale, latency, usage, or improvement metrics where possible.",
            )
        )

    if not linkedin:
        score -= 2
        quick_fixes.append("Add LinkedIn profile link in the header.")

    if not github:
        score -= 2
        quick_fixes.append("Add GitHub profile link if relevant to the target role.")

    if not summary:
        quick_fixes.append("Write a role-specific summary in 2–4 lines.")
    if not has_quantified_bullet(experience_bullets + project_bullets):
        quick_fixes.append("Rewrite at least 3 bullets with measurable outcomes.")
    if len(experience_bullets) < 2:
        quick_fixes.append("Expand experience bullets with stronger evidence.")
    if len(project_bullets) < 2:
        quick_fixes.append("Add project bullets that show tools, actions, and results.")

    score = max(0, min(score, 100))

    if score >= 85:
        grade = "Strong"
    elif score >= 70:
        grade = "Good"
    elif score >= 55:
        grade = "Fair"
    else:
        grade = "Weak"

    return {
        "score": score,
        "grade": grade,
        "issues": issues,
        "quick_fixes": quick_fixes[:6],
    }