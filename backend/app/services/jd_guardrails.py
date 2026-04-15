import re


JOB_HINT_WORDS = [
    "responsibilities",
    "requirements",
    "qualifications",
    "skills",
    "experience",
    "preferred",
    "must have",
    "nice to have",
    "role",
    "job description",
    "about the role",
    "what you will do",
    "what we are looking for",
    "candidate",
    "eligibility",
]

HTML_PATTERN = re.compile(
    r"</?(html|head|body|div|span|script|style|meta|link|svg|path|iframe|noscript|button|input|form)[^>]*>",
    re.IGNORECASE,
)

CODE_PATTERN = re.compile(
    r"(function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|<script|</script>|import\s+\w+|export\s+default|class\s+\w+)",
    re.IGNORECASE,
)


def validate_job_description_input(text: str) -> str:
    cleaned = (text or "").strip()

    if not cleaned:
        raise ValueError("Please paste a job description.")

    if len(cleaned) < 120:
        raise ValueError("The pasted content looks too short to be a proper job description.")

    html_tags = re.findall(r"<[^>]+>", cleaned)
    if HTML_PATTERN.search(cleaned) or len(html_tags) >= 3:
        raise ValueError(
            "The pasted content looks like HTML or webpage markup. Paste only clean JD text."
        )

    if CODE_PATTERN.search(cleaned):
        raise ValueError(
            "The pasted content looks like code or script text, not a job description."
        )

    lower = cleaned.lower()
    hits = sum(1 for word in JOB_HINT_WORDS if word in lower)

    if hits < 2:
        raise ValueError(
            "This does not look like a normal job description. Paste a JD with role, requirements, responsibilities, skills, or qualifications."
        )

    return cleaned