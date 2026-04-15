from app.services.parser import extract_resume_text
from app.services.preprocess import clean_text, lemmatize_text
from app.services.extractor import (
    extract_skills_from_text,
    categorize_extracted_skills,
    extract_skills_from_sections,
)
from app.services.section_parser import split_resume_into_sections
from app.services.jd_parser import parse_jd_requirements
from app.services.domain_detector import detect_domain, choose_active_domain, build_reliability_meta
from app.services.matcher_engine import (
    exact_skill_match,
    missing_skill_match,
    fuzzy_skill_match,
    semantic_text_similarity,
    detect_critical_missing_skills,
    detect_preferred_missing_skills,
)
from app.services.evidence_validator import (
    validate_matched_skills_evidence,
    summarize_evidence_strength,
)
from app.services.experience_estimator import (
    estimate_total_experience_years,
    compare_with_jd_experience_requirement,
)
from app.services.scorer import calculate_match_score
from app.services.suggester import generate_resume_suggestions
from app.services.llm.llm_service import get_llm_provider
from app.services.llm.mock_llm import MockLLMProvider
from app.services.resume_structurer import structure_resume_for_tailoring
from app.services.ats_auditor import build_ats_audit
from app.services.keyword_coverage import build_keyword_coverage_report
from app.services.shortlist_simulator import simulate_shortlist_outcome


def _generate_llm_explanation(payload: dict) -> dict:
    try:
        llm_provider = get_llm_provider()
        return llm_provider.generate_explanation(payload)
    except Exception:
        fallback_provider = MockLLMProvider()
        return fallback_provider.generate_explanation(payload)


def analyze_resume_text_against_jd(
    resume_text: str,
    job_description: str,
    filename: str = "resume.txt",
    include_llm_explanation: bool = True,
) -> dict:
    resume_sections = split_resume_into_sections(resume_text)

    cleaned_resume = clean_text(resume_text)
    cleaned_jd = clean_text(job_description)

    lemmatized_resume = lemmatize_text(cleaned_resume)
    lemmatized_jd = lemmatize_text(cleaned_jd)

    resume_domain = detect_domain(cleaned_resume)
    jd_domain = detect_domain(cleaned_jd)
    active_domain = choose_active_domain(resume_domain, jd_domain)
    active_domain_name = active_domain.get("domain")

    resume_skills = extract_skills_from_text(cleaned_resume, active_domain_name)

    jd_info = parse_jd_requirements(job_description, active_domain_name)
    required_skills = jd_info["required_skills"]
    preferred_skills = jd_info["preferred_skills"]
    general_skills = jd_info["general_skills"]
    jd_skills = jd_info["all_jd_skills"]
    experience_requirements = jd_info["experience_requirements"]
    education_requirements = jd_info["education_requirements"]

    categorized_resume_skills = categorize_extracted_skills(resume_skills, active_domain_name)
    categorized_jd_skills = categorize_extracted_skills(jd_skills, active_domain_name)

    cleaned_section_map = {
        section: clean_text(text)
        for section, text in resume_sections.items()
    }
    section_skill_map = extract_skills_from_sections(cleaned_section_map, active_domain_name)

    matched_skills = exact_skill_match(resume_skills, jd_skills)
    missing_skills = missing_skill_match(resume_skills, jd_skills)
    fuzzy_matches = fuzzy_skill_match(resume_skills, jd_skills)

    semantic_score = semantic_text_similarity(lemmatized_resume, lemmatized_jd)

    critical_missing_skills = detect_critical_missing_skills(required_skills, missing_skills)
    preferred_missing_skills = detect_preferred_missing_skills(preferred_skills, missing_skills)

    skill_evidence_map = validate_matched_skills_evidence(matched_skills, resume_sections)
    evidence_summary = summarize_evidence_strength(skill_evidence_map)

    experience_text = resume_sections.get("experience", "")
    experience_estimate = estimate_total_experience_years(experience_text)
    experience_comparison = compare_with_jd_experience_requirement(
        estimated_resume_years=experience_estimate["estimated_years"],
        min_required_years=experience_requirements.get("min_years_experience"),
    )

    scores = calculate_match_score(
        matched_skills=matched_skills,
        semantic_score=semantic_score,
        section_skill_map=section_skill_map,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        general_skills=general_skills,
        critical_missing_skills=critical_missing_skills,
        skill_support_score=evidence_summary["skill_support_score"],
    )

    suggestions = generate_resume_suggestions(
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        critical_missing_skills=critical_missing_skills,
        preferred_missing_skills=preferred_missing_skills,
        scores=scores,
        section_skill_map=section_skill_map,
        experience_requirements=experience_requirements,
        education_requirements=education_requirements,
        evidence_summary=evidence_summary,
        experience_comparison=experience_comparison,
    )

    structured_resume = structure_resume_for_tailoring(
        {
            "resume_sections": resume_sections,
            "resume_skills": resume_skills,
            "raw_resume_text": resume_text,
        }
    )

    ats_audit = build_ats_audit(structured_resume)

    keyword_coverage = build_keyword_coverage_report(
        jd_requirements={
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "general_skills": general_skills,
        },
        evidence_summary=evidence_summary,
        skill_evidence_map=skill_evidence_map,
        missing_skills=missing_skills,
    )

    shortlist_simulation = simulate_shortlist_outcome(
        scores=scores,
        critical_missing_skills=critical_missing_skills,
        preferred_missing_skills=preferred_missing_skills,
        experience_comparison=experience_comparison,
        ats_audit=ats_audit,
        keyword_coverage=keyword_coverage,
    )

    analysis_meta = build_reliability_meta(
        resume_domain=resume_domain,
        jd_domain=jd_domain,
        resume_skills_count=len(resume_skills),
        jd_skills_count=len(jd_skills),
    )
    analysis_meta["active_domain"] = active_domain

    llm_explanation = None
    if include_llm_explanation:
        llm_explanation = _generate_llm_explanation(
            {
                "filename": filename,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "critical_missing_skills": critical_missing_skills,
                "preferred_missing_skills": preferred_missing_skills,
                "scores": scores,
                "jd_requirements": {
                    "required_skills": required_skills,
                    "preferred_skills": preferred_skills,
                    "general_skills": general_skills,
                    "experience_requirements": experience_requirements,
                    "education_requirements": education_requirements,
                },
                "suggestions": suggestions,
                "analysis_meta": analysis_meta,
            }
        )

    return {
        "filename": filename,
        "raw_resume_text": resume_text,
        "resume_sections": resume_sections,
        "structured_resume": structured_resume,
        "section_skill_map": section_skill_map,
        "resume_skills": resume_skills,
        "jd_requirements": {
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "general_skills": general_skills,
            "experience_requirements": experience_requirements,
            "education_requirements": education_requirements,
        },
        "categorized_resume_skills": categorized_resume_skills,
        "categorized_jd_skills": categorized_jd_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "critical_missing_skills": critical_missing_skills,
        "preferred_missing_skills": preferred_missing_skills,
        "fuzzy_matches": fuzzy_matches,
        "skill_evidence_map": skill_evidence_map,
        "evidence_summary": evidence_summary,
        "experience_estimate": experience_estimate,
        "experience_comparison": experience_comparison,
        "scores": scores,
        "suggestions": suggestions,
        "llm_explanation": llm_explanation,
        "ats_audit": ats_audit,
        "keyword_coverage": keyword_coverage,
        "shortlist_simulation": shortlist_simulation,
        "analysis_meta": analysis_meta,
        "resume_domain": resume_domain,
        "jd_domain": jd_domain,
    }


def analyze_resume_against_jd(
    file_path: str,
    filename: str,
    job_description: str,
    include_llm_explanation: bool = True,
) -> dict:
    resume_text = extract_resume_text(file_path, filename)

    return analyze_resume_text_against_jd(
        resume_text=resume_text,
        job_description=job_description,
        filename=filename,
        include_llm_explanation=include_llm_explanation,
    )