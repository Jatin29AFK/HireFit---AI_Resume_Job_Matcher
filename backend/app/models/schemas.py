from pydantic import BaseModel
from typing import Optional, Any


class ExperienceRequirements(BaseModel):
    min_years_experience: Optional[int] = None


class JDRequirements(BaseModel):
    required_skills: list[str]
    preferred_skills: list[str]
    general_skills: list[str]
    experience_requirements: ExperienceRequirements
    education_requirements: list[str]


class EvidenceItem(BaseModel):
    skill: str
    mentioned_in: list[str]
    supporting_lines: list[str]
    has_action_evidence: bool
    evidence_strength: str


class EvidenceSummary(BaseModel):
    strong_evidence_skills: list[str]
    medium_evidence_skills: list[str]
    weak_evidence_skills: list[str]
    skill_support_score: float


class ExperienceEstimate(BaseModel):
    estimated_years: Optional[int] = None
    ranges_found: list[tuple[int, int]]
    note: str


class ExperienceComparison(BaseModel):
    meets_requirement: Optional[bool] = None
    gap_years: Optional[int] = None
    message: str


class MatchScores(BaseModel):
    required_skill_score: float
    preferred_skill_score: float
    general_skill_score: float
    weighted_skill_score: float
    semantic_score: float
    section_evidence_score: float
    skill_support_score: float
    critical_missing_penalty: float
    overall_score: float
    fit_label: str


class LLMExplanation(BaseModel):
    fit_summary: str
    strengths: list[str]
    weaknesses: list[str]
    llm_recommendations: list[str]
    provider: str


class StructuredResume(BaseModel):
    full_name: str = ""
    current_title: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    github: str = ""
    location: str = ""
    headline: str = ""
    summary: str = ""
    skills: list[str]
    experience_bullets: list[str]
    project_bullets: list[str]
    education: str = ""
    certifications: str = ""


class ATSAuditIssue(BaseModel):
    title: str
    severity: str
    details: str
    recommendation: str


class ATSAuditReport(BaseModel):
    score: float
    grade: str
    issues: list[ATSAuditIssue]
    quick_fixes: list[str]


class KeywordCoverageItem(BaseModel):
    skill: str
    priority: str
    status: str
    evidence_sections: list[str]


class KeywordCoverageSummary(BaseModel):
    strong_count: int
    medium_count: int
    weak_count: int
    missing_count: int


class KeywordCoverageReport(BaseModel):
    items: list[KeywordCoverageItem]
    summary: KeywordCoverageSummary


class ShortlistSimulation(BaseModel):
    verdict: str
    reasons: list[str]
    action_plan: list[str]


class AnalysisSnapshot(BaseModel):
    overall_score: float
    fit_label: str
    matched_skills: list[str]
    missing_skills: list[str]
    critical_missing_skills: list[str]


class TailoringPlan(BaseModel):
    target_role_keywords: list[str]
    skills_to_emphasize: list[str]
    skills_not_allowed_to_add: list[str]
    allowed_skill_terms: list[str]
    sections_to_rewrite: list[str]
    unresolved_gaps: list[str]
    manual_review_notice: str
    user_should_review_on_own: bool


class TailoredResumeDraft(BaseModel):
    headline: str
    summary: str
    skills: list[str]
    experience_bullets: list[str]
    project_bullets: list[str]
    change_log: list[str]
    manual_review_note: str
    unresolved_gaps: list[str]


class TailorValidation(BaseModel):
    unsupported_added_terms: list[str]
    safe_to_export: bool
    manual_review_required: bool
    manual_review_notice: str
    validator_notes: list[str]


class ResumeTailorResponse(BaseModel):
    analysis_before: AnalysisSnapshot
    tailoring_plan: TailoringPlan
    structured_resume: StructuredResume
    tailored_resume: TailoredResumeDraft
    validation: TailorValidation
    analysis_after: AnalysisSnapshot
    score_delta: float
    manual_review_notice: str
    user_should_review_on_own: bool


class JDComparisonItem(BaseModel):
    jd_index: int
    jd_title: str
    overall_score: float
    fit_label: str
    required_skill_score: float
    skill_support_score: float
    critical_missing_skills: list[str]
    matched_skills: list[str]


class MultiJDCompareResponse(BaseModel):
    resume_filename: str
    comparisons: list[JDComparisonItem]
    best_match: Optional[JDComparisonItem] = None


class DomainDetectionResult(BaseModel):
    domain: str
    label: str
    score: float
    confidence: str
    all_scores: dict[str, float]


class AnalysisMeta(BaseModel):
    reliability: str
    warning_message: Optional[str] = None
    resume_domain: DomainDetectionResult
    jd_domain: DomainDetectionResult
    active_domain: DomainDetectionResult


class MatchAnalysisResponse(BaseModel):
    filename: str
    raw_resume_text: str
    resume_sections: dict[str, str]
    structured_resume: StructuredResume
    section_skill_map: dict[str, list[str]]
    resume_skills: list[str]
    jd_requirements: JDRequirements
    categorized_resume_skills: dict[str, list[str]]
    categorized_jd_skills: dict[str, list[str]]
    matched_skills: list[str]
    missing_skills: list[str]
    critical_missing_skills: list[str]
    preferred_missing_skills: list[str]
    fuzzy_matches: list[tuple[str, str, float]]
    skill_evidence_map: dict[str, EvidenceItem]
    evidence_summary: EvidenceSummary
    experience_estimate: ExperienceEstimate
    experience_comparison: ExperienceComparison
    scores: MatchScores
    suggestions: list[str]
    llm_explanation: Optional[LLMExplanation] = None
    ats_audit: ATSAuditReport
    keyword_coverage: KeywordCoverageReport
    shortlist_simulation: ShortlistSimulation
    analysis_meta: Optional[AnalysisMeta] = None
    resume_domain: Optional[DomainDetectionResult] = None
    jd_domain: Optional[DomainDetectionResult] = None


class ErrorResponse(BaseModel):
    detail: str