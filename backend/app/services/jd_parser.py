import re
from app.services.extractor import extract_skills_from_text, normalize_skill


REQUIRED_PATTERNS = [
    r"\brequired\b",
    r"\bmust have\b",
    r"\bmandatory\b",
    r"\bessential\b",
    r"\bminimum qualifications\b",
    r"\bbasic qualifications\b"
]

PREFERRED_PATTERNS = [
    r"\bpreferred\b",
    r"\bgood to have\b",
    r"\bnice to have\b",
    r"\bplus\b",
    r"\bpreferred qualifications\b"
]

EDUCATION_PATTERNS = [
    r"\bbachelor(?:'s)?\b",
    r"\bmaster(?:'s)?\b",
    r"\bm\.?tech\b",
    r"\bb\.?tech\b",
    r"\bbe\b",
    r"\bbsc\b",
    r"\bmsc\b",
    r"\bphd\b",
    r"\bcomputer science\b",
    r"\binformation technology\b",
    r"\bengineering\b",
    r"\bmechanical\b",
    r"\baerospace\b",
    r"\belectrical\b",
    r"\belectronics\b",
]

def split_jd_lines(job_description: str) -> list[str]:
    return [line.strip() for line in job_description.splitlines() if line.strip()]


def classify_jd_line(line: str) -> str:
    lower_line = line.lower()

    for pattern in REQUIRED_PATTERNS:
        if re.search(pattern, lower_line):
            return "required_header"

    for pattern in PREFERRED_PATTERNS:
        if re.search(pattern, lower_line):
            return "preferred_header"

    return "content"


def extract_experience_requirements(job_description: str) -> dict:
    text = job_description.lower()

    patterns = [
        r"(\d+)\+?\s+years? of experience",
        r"minimum\s+(\d+)\+?\s+years?",
        r"at least\s+(\d+)\+?\s+years?",
        r"~?(\d+)\s*-\s*(\d+)\s*years?"
    ]

    years = []

    for pattern in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            if isinstance(match, tuple):
                for item in match:
                    try:
                        years.append(int(item))
                    except ValueError:
                        pass
            else:
                try:
                    years.append(int(match))
                except ValueError:
                    pass

    return {
        "min_years_experience": max(years) if years else None
    }


def extract_education_requirements(job_description: str) -> list[str]:
    lower_text = job_description.lower()
    found = set()

    for pattern in EDUCATION_PATTERNS:
        matches = re.findall(pattern, lower_text)
        for match in matches:
            found.add(match.lower())

    return sorted(found)


def parse_jd_requirements(job_description: str, domain_name: str | None = None) -> dict:
    lines = split_jd_lines(job_description)

    required_lines = []
    preferred_lines = []
    general_lines = []

    current_mode = "general"

    for line in lines:
        line_type = classify_jd_line(line)

        if line_type == "required_header":
            current_mode = "required"
            continue
        elif line_type == "preferred_header":
            current_mode = "preferred"
            continue

        if current_mode == "required":
            required_lines.append(line)
        elif current_mode == "preferred":
            preferred_lines.append(line)
        else:
            general_lines.append(line)

    required_text = "\n".join(required_lines)
    preferred_text = "\n".join(preferred_lines)
    general_text = "\n".join(general_lines)

    required_skills = [normalize_skill(skill, domain_name) for skill in extract_skills_from_text(required_text, domain_name)]
    preferred_skills = [normalize_skill(skill, domain_name) for skill in extract_skills_from_text(preferred_text, domain_name)]
    general_skills = [normalize_skill(skill, domain_name) for skill in extract_skills_from_text(general_text, domain_name)]

    all_jd_skills = sorted(set(required_skills + preferred_skills + general_skills))

    if not all_jd_skills:
        fallback_skills = [
            normalize_skill(skill, domain_name)
            for skill in extract_skills_from_text(job_description, domain_name)
        ]
        general_skills = sorted(set(fallback_skills))
        all_jd_skills = sorted(set(general_skills))

    return {
        "required_skills": sorted(set(required_skills)),
        "preferred_skills": sorted(set(preferred_skills)),
        "general_skills": sorted(set(general_skills)),
        "all_jd_skills": all_jd_skills,
        "experience_requirements": extract_experience_requirements(job_description),
        "education_requirements": extract_education_requirements(job_description),
    }