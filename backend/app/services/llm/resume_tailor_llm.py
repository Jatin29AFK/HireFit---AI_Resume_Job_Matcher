import json
import os
import re
from google import genai
from app.services.llm.tailor_prompt_builder import build_tailor_resume_prompt


def strip_code_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _normalize_line(line: str) -> str:
    return re.sub(r"\s+", " ", (line or "").strip())


def _looks_like_meta_fragment(line: str) -> bool:
    value = line.strip().lower()
    if not value:
        return True

    is_date = bool(
        re.search(r"\b(19|20)\d{2}\b", value)
        or "present" in value
        or re.search(
            r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\b",
            value,
        )
    )
    is_location = "," in value or any(
        city in value
        for city in [
            "noida", "pune", "gurugram", "bangalore", "hyderabad",
            "delhi", "india", "punjab", "remote"
        ]
    )

    return (is_date or is_location) and len(value) < 60


def _split_embedded_bullets(line: str) -> list[str]:
    if not line:
        return []

    text = line.replace("∗", "\n* ").replace("•", "\n* ")
    text = re.sub(r"\s+\*\s*", "\n* ", text)
    text = re.sub(r"\n{2,}", "\n", text)

    parts = []
    for part in text.splitlines():
        cleaned = _normalize_line(part)
        if cleaned:
            parts.append(cleaned)

    return parts


def sanitize_bullet_list(items: list[str]) -> list[str]:
    if not items:
        return []

    expanded = []
    for item in items:
        expanded.extend(_split_embedded_bullets(item))

    cleaned = []
    seen = set()

    for raw in expanded:
        line = _normalize_line(raw)
        if not line:
            continue

        line = line.lstrip("•").strip()

        if _looks_like_meta_fragment(line):
            continue

        if line.startswith("*"):
            line = f"* {line.lstrip('*').strip()}"
        elif line.startswith("–") or line.startswith("- "):
            line = f"– {line.lstrip('–').lstrip('-').strip()}"
        else:
            if len(line) < 95 and not line.endswith("."):
                line = f"– {line}"
            else:
                line = f"* {line}"

        key = line.lower()
        if key not in seen:
            seen.add(key)
            cleaned.append(line)

    return cleaned


def mock_tailored_resume(structured_resume: dict, tailoring_plan: dict) -> dict:
    emphasized_skills = tailoring_plan.get("skills_to_emphasize", [])
    target_keywords = tailoring_plan.get("target_role_keywords", [])
    unresolved_gaps = tailoring_plan.get("unresolved_gaps", [])

    original_summary = structured_resume.get("summary", "")
    original_skills = structured_resume.get("skills", [])
    experience_bullets = sanitize_bullet_list(structured_resume.get("experience_bullets", []))
    project_bullets = sanitize_bullet_list(structured_resume.get("project_bullets", []))

    ordered_skills = []
    for skill in emphasized_skills + original_skills:
        if skill not in ordered_skills:
            ordered_skills.append(skill)

    headline = " | ".join(target_keywords[:4]) if target_keywords else "Optimized Resume Draft"

    summary_prefix = ""
    if emphasized_skills:
        summary_prefix = f"Profile aligned around {', '.join(emphasized_skills[:4])}. "

    summary = (summary_prefix + original_summary).strip()

    change_log = [
        "Reordered and emphasized JD-relevant skills already present in the resume.",
        "Strengthened summary wording using supported role-relevant terminology.",
        "Cleaned experience and project bullets into a more structured format.",
        "Preserved unresolved gaps instead of adding unsupported claims.",
    ]

    return {
        "headline": headline,
        "summary": summary,
        "skills": ordered_skills,
        "experience_bullets": experience_bullets,
        "project_bullets": project_bullets,
        "change_log": change_log,
        "manual_review_note": tailoring_plan.get("manual_review_notice", ""),
        "unresolved_gaps": unresolved_gaps,
    }


def generate_tailored_resume_draft(structured_resume: dict, tailoring_plan: dict) -> dict:
    provider = os.getenv("LLM_PROVIDER", "mock").lower()

    if provider != "gemini":
        return mock_tailored_resume(structured_resume, tailoring_plan)

    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    if not api_key:
        return mock_tailored_resume(structured_resume, tailoring_plan)

    prompt = build_tailor_resume_prompt(structured_resume, tailoring_plan)

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )

        raw_text = strip_code_fences((response.text or "").strip())
        parsed = json.loads(raw_text)

        if "manual_review_note" not in parsed or not parsed["manual_review_note"]:
            parsed["manual_review_note"] = tailoring_plan.get("manual_review_notice", "")

        if "unresolved_gaps" not in parsed:
            parsed["unresolved_gaps"] = tailoring_plan.get("unresolved_gaps", [])

        parsed["experience_bullets"] = sanitize_bullet_list(parsed.get("experience_bullets", []))
        parsed["project_bullets"] = sanitize_bullet_list(parsed.get("project_bullets", []))

        return parsed

    except Exception:
        return mock_tailored_resume(structured_resume, tailoring_plan)