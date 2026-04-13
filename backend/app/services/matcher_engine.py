from rapidfuzz import fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.extractor import normalize_skill


def exact_skill_match(resume_skills: list[str], jd_skills: list[str]) -> list[str]:
    resume_set = {normalize_skill(skill) for skill in resume_skills}
    jd_set = {normalize_skill(skill) for skill in jd_skills}
    return sorted(resume_set.intersection(jd_set))


def missing_skill_match(resume_skills: list[str], jd_skills: list[str]) -> list[str]:
    resume_set = {normalize_skill(skill) for skill in resume_skills}
    jd_set = {normalize_skill(skill) for skill in jd_skills}
    return sorted(jd_set - resume_set)


def fuzzy_skill_match(
    resume_skills: list[str],
    jd_skills: list[str],
    threshold: int = 85
) -> list[tuple[str, str, float]]:
    matches = []
    seen_pairs = set()

    normalized_resume = [normalize_skill(skill) for skill in resume_skills]
    normalized_jd = [normalize_skill(skill) for skill in jd_skills]

    for jd_skill in normalized_jd:
        for resume_skill in normalized_resume:
            score = fuzz.ratio(jd_skill, resume_skill)
            pair = tuple(sorted((jd_skill, resume_skill)))
            if score >= threshold and jd_skill != resume_skill and pair not in seen_pairs:
                matches.append((jd_skill, resume_skill, round(score, 2)))
                seen_pairs.add(pair)

    return matches


def semantic_text_similarity(resume_text: str, jd_text: str) -> float:
    """
    Lightweight semantic-ish similarity using TF-IDF + cosine similarity.
    Suitable for deployment on Render.
    """
    texts = [resume_text, jd_text]

    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    matrix = vectorizer.fit_transform(texts)

    similarity = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
    return float(similarity)


def detect_critical_missing_skills(
    required_skills: list[str],
    missing_skills: list[str]
) -> list[str]:
    required_set = {normalize_skill(skill) for skill in required_skills}
    missing_set = {normalize_skill(skill) for skill in missing_skills}
    return sorted(required_set.intersection(missing_set))


def detect_preferred_missing_skills(
    preferred_skills: list[str],
    missing_skills: list[str]
) -> list[str]:
    preferred_set = {normalize_skill(skill) for skill in preferred_skills}
    missing_set = {normalize_skill(skill) for skill in missing_skills}
    return sorted(preferred_set.intersection(missing_set))