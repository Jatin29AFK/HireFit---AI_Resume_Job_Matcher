from functools import lru_cache
from rapidfuzz import fuzz
from app.services.extractor import normalize_skill


@lru_cache(maxsize=1)
def get_embedding_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


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
    from sentence_transformers import util

    embedding_model = get_embedding_model()
    resume_embedding = embedding_model.encode(resume_text, convert_to_tensor=True)
    jd_embedding = embedding_model.encode(jd_text, convert_to_tensor=True)

    similarity = util.cos_sim(resume_embedding, jd_embedding)
    return float(similarity.item())


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