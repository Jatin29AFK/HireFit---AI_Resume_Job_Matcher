import json
import re
from typing import List, Optional

import requests
from bs4 import BeautifulSoup


REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


GOOD_KEYWORDS = [
    "job description",
    "responsibilities",
    "requirements",
    "qualifications",
    "skills",
    "what you'll do",
    "what you will do",
    "about the role",
    "about the job",
    "role overview",
    "experience",
    "education",
    "must have",
    "preferred",
    "nice to have",
    "technology responsibilities",
    "program responsibilities",
    "extended responsibilities",
]

BAD_KEYWORDS = [
    "similar jobs",
    "recommended jobs",
    "view all jobs",
    "apply now",
    "sign in",
    "join talent community",
    "powered by",
    "privacy policy",
    "cookie",
    "linkedin",
    "follow us",
    "recent awards",
    "great place to work",
    "most admired companies",
    "ethisphere",
    "newsweek",
    "about us",
    "benefits",
    "equal opportunity employer",
    "accommodation request",
    "share this job",
]


SITE_SPECIFIC_SELECTORS = [
    # Greenhouse
    '[id="content"]',
    '[class*="job-post"]',
    '[class*="job__description"]',

    # Lever
    '[class*="posting-page"]',
    '[class*="posting-requirements"]',
    '[class*="posting-categories"]',

    # Workday
    '[data-automation-id="jobPostingDescription"]',
    '[data-automation-id="jobPostingHeader"]',

    # Eightfold-like
    '[class*="job-description"]',
    '[class*="description"]',
    '[class*="jobDescription"]',
    '[class*="posting"]',
    "main",
    "article",
]


def _normalize_whitespace(text: str) -> str:
    text = text.replace("\\n", "\n").replace("\\t", " ")
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _clean_text_block(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    return _normalize_whitespace(text)


def _looks_like_noise(text: str) -> bool:
    lowered = text.lower()
    return any(bad in lowered for bad in BAD_KEYWORDS)


def _looks_relevant(text: str) -> bool:
    text = text.strip()
    lowered = text.lower()

    if len(text) < 40:
        return False

    if _looks_like_noise(text):
        return False

    if any(good in lowered for good in GOOD_KEYWORDS):
        return True

    # Accept medium/large blocks that look job-like
    signal_terms = [
        "responsible", "qualification", "requirement", "candidate", "experience",
        "degree", "skills", "role", "job", "position", "design", "analysis",
        "develop", "support", "work closely", "team", "engineering"
    ]
    score = sum(1 for term in signal_terms if term in lowered)
    return score >= 2


def _dedupe_blocks(blocks: List[str]) -> List[str]:
    seen = set()
    cleaned = []

    for block in blocks:
        normalized = re.sub(r"\s+", " ", block.strip().lower())
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        cleaned.append(block.strip())

    return cleaned


def _extract_from_json_ld(soup: BeautifulSoup) -> List[str]:
    results = []

    for script in soup.find_all("script", type="application/ld+json"):
        raw = script.string or script.get_text(strip=True)
        if not raw:
            continue

        try:
            data = json.loads(raw)
        except Exception:
            continue

        items = data if isinstance(data, list) else [data]

        for item in items:
            if not isinstance(item, dict):
                continue

            text_parts = []

            if item.get("@type") in {"JobPosting", "Posting"}:
                for key in [
                    "title",
                    "description",
                    "qualifications",
                    "responsibilities",
                    "skills",
                    "experienceRequirements",
                    "educationRequirements",
                ]:
                    value = item.get(key)
                    if isinstance(value, str):
                        text_parts.append(value)
                    elif isinstance(value, list):
                        text_parts.extend([v for v in value if isinstance(v, str)])

            combined = _clean_text_block("\n\n".join(text_parts))
            if _looks_relevant(combined):
                results.append(combined)

    return results


def _extract_from_embedded_json(raw_html: str) -> List[str]:
    results = []

    # Common "description":"..." style fields
    patterns = [
        r'"description"\s*:\s*"(.{80,20000}?)"',
        r'"jobDescription"\s*:\s*"(.{80,20000}?)"',
        r'"qualifications"\s*:\s*"(.{40,10000}?)"',
        r'"responsibilities"\s*:\s*"(.{40,10000}?)"',
        r'"title"\s*:\s*"(.{3,200}?)"\s*,\s*"body"\s*:\s*"(.{40,15000}?)"',
    ]

    for pattern in patterns:
        for match in re.finditer(pattern, raw_html, re.IGNORECASE | re.DOTALL):
            groups = match.groups()
            combined = "\n\n".join(groups)
            combined = combined.encode("utf-8", "ignore").decode("unicode_escape", errors="ignore")
            combined = _clean_text_block(combined)

            if _looks_relevant(combined):
                results.append(combined)

    return results


def _extract_from_site_specific_selectors(soup: BeautifulSoup) -> List[str]:
    results = []

    for selector in SITE_SPECIFIC_SELECTORS:
        try:
            nodes = soup.select(selector)
        except Exception:
            continue

        for node in nodes:
            text = _clean_text_block(node.get_text("\n", strip=True))
            if _looks_relevant(text):
                results.append(text)

    return results


def _extract_from_headings_and_sections(soup: BeautifulSoup) -> List[str]:
    results = []

    for heading in soup.find_all(["h1", "h2", "h3", "h4"]):
        heading_text = heading.get_text(" ", strip=True)
        if not heading_text:
            continue

        lowered = heading_text.lower()
        if not any(word in lowered for word in GOOD_KEYWORDS):
            continue

        section_parts = [heading_text]

        for sibling in heading.find_all_next(limit=12):
            if sibling.name in {"h1", "h2", "h3", "h4"}:
                break

            text = sibling.get_text(" ", strip=True)
            if text and not _looks_like_noise(text):
                section_parts.append(text)

        combined = _clean_text_block("\n\n".join(section_parts))
        if _looks_relevant(combined):
            results.append(combined)

    return results


def _extract_generic_blocks(soup: BeautifulSoup) -> List[str]:
    results = []

    for tag in soup.find_all(["section", "article", "div", "p", "li"]):
        text = _clean_text_block(tag.get_text(" ", strip=True))
        if _looks_relevant(text):
            results.append(text)

    return results


def _prune_soup(soup: BeautifulSoup) -> None:
    for tag in soup([
        "script", "style", "noscript", "svg", "img", "footer",
        "header", "nav", "aside", "form", "button"
    ]):
        tag.decompose()


def _score_block(text: str) -> int:
    lowered = text.lower()
    score = 0

    for good in GOOD_KEYWORDS:
        if good in lowered:
            score += 3

    for weak in ["responsible", "qualification", "requirement", "candidate", "experience", "degree", "engineering"]:
        if weak in lowered:
            score += 1

    score += min(len(text) // 400, 6)

    if _looks_like_noise(text):
        score -= 10

    return score


def _pick_best_blocks(blocks: List[str], max_blocks: int = 8) -> List[str]:
    ranked = sorted(
        ((block, _score_block(block)) for block in blocks),
        key=lambda x: x[1],
        reverse=True,
    )

    selected = []
    for block, score in ranked:
        if score <= 0:
            continue
        selected.append(block)
        if len(selected) >= max_blocks:
            break

    return selected


def extract_job_description_from_url(url: str) -> str:
    response = requests.get(url, headers=REQUEST_HEADERS, timeout=25)
    response.raise_for_status()

    raw_html = response.text
    soup = BeautifulSoup(raw_html, "html.parser")

    title = ""
    if soup.title:
        title = _clean_text_block(soup.title.get_text(" ", strip=True))

    ld_json_blocks = _extract_from_json_ld(soup)
    embedded_json_blocks = _extract_from_embedded_json(raw_html)

    cleaned_soup = BeautifulSoup(raw_html, "html.parser")
    _prune_soup(cleaned_soup)

    selector_blocks = _extract_from_site_specific_selectors(cleaned_soup)
    heading_blocks = _extract_from_headings_and_sections(cleaned_soup)
    generic_blocks = _extract_generic_blocks(cleaned_soup)

    candidate_blocks = []
    if title and not _looks_like_noise(title):
        candidate_blocks.append(title)

    candidate_blocks.extend(ld_json_blocks)
    candidate_blocks.extend(embedded_json_blocks)
    candidate_blocks.extend(selector_blocks)
    candidate_blocks.extend(heading_blocks)
    candidate_blocks.extend(generic_blocks)

    candidate_blocks = _dedupe_blocks(candidate_blocks)
    best_blocks = _pick_best_blocks(candidate_blocks, max_blocks=10)

    extracted = _normalize_whitespace("\n\n".join(best_blocks))

    if len(extracted) < 120:
        raise ValueError(
            "Could not extract a reliable job description from this URL. "
            "Please paste the JD manually."
        )

    return extracted