import React, { useEffect, useRef, useState } from 'react'
import UploadForm from './components/UploadForm'
import SkillsSection from './components/SkillsSection'
import SuggestionsSection from './components/SuggestionsSection'
import LoadingSpinner from './components/LoadingSpinner'
import SummaryHero from './components/SummaryHero'
import JDRequirementsCard from './components/JDRequirementsCard'
import CategorizedSkillsPanel from './components/CategorizedSkillsPanel'
import EvidencePanel from './components/EvidencePanel'
import ExperiencePanel from './components/ExperiencePanel'
import ProgressBarCard from './components/ProgressBarCard'
import CollapsibleSection from './components/CollapsibleSection'
import EvidenceDetailsPanel from './components/EvidenceDetailsPanel'
import EmptyState from './components/EmptyState'
import ActionBar from './components/ActionBar'
import ResultTabs from './components/ResultTabs'
import LLMExplanationPanel from './components/LLMExplanationPanel'
import TailorResumeButton from './components/TailorResumeButton'
import ManualReviewBanner from './components/ManualReviewBanner'
import TailorComparisonPanel from './components/TailorComparisonPanel'
import TailoredResumePanel from './components/TailoredResumePanel'
import UnresolvedGapsPanel from './components/UnresolvedGapsPanel'
import ExportTailoredResumeButtons from './components/ExportTailoredResumeButtons'
import ATSAuditPanel from './components/ATSAuditPanel'
import KeywordCoveragePanel from './components/KeywordCoveragePanel'
import ShortlistRiskPanel from './components/ShortlistRiskPanel'
import MultiJDComparePanel from './components/MultiJDComparePanel'
import MiniSummaryCards from './components/MiniSummaryCards'
import AppBrand from './components/AppBrand'
import ThemeToggle from './components/ThemeToggle'

import {
  analyzeResume,
  tailorResume,
  compareMultipleJDs,
} from './services/api'

function cloneFormData(formData) {
  const newFormData = new FormData()
  for (const [key, value] of formData.entries()) {
    newFormData.append(key, value)
  }
  return newFormData
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function getVerdictPenalty(shortlistSimulation) {
  const verdict = shortlistSimulation?.verdict?.toLowerCase() || ''
  if (verdict.includes('high')) return -15
  if (verdict.includes('moderate')) return -6
  if (verdict.includes('lower')) return 6
  return 0
}

function getApplyReadiness(result, tailorResult) {
  if (!result) {
    return {
      score: 0,
      label: 'Unknown',
      badgeClass: 'bg-gray-100 text-gray-800',
    }
  }

  const baseOverall = tailorResult
    ? tailorResult.analysis_after?.overall_score ?? result.scores?.overall_score ?? 0
    : result.scores?.overall_score ?? 0

  const atsScore = result.ats_audit?.score ?? 0
  const skillSupport = result.scores?.skill_support_score ?? 0
  const criticalMissing = result.critical_missing_skills?.length ?? 0

  let score =
    baseOverall * 0.5 +
    atsScore * 0.25 +
    skillSupport * 0.2 +
    getVerdictPenalty(result.shortlist_simulation) -
    Math.min(criticalMissing * 5, 20)

  score = clamp(score)

  if (score >= 80) {
    return {
      score,
      label: 'Ready to Apply',
      badgeClass: 'bg-green-100 text-green-800',
    }
  }

  if (score >= 65) {
    return {
      score,
      label: 'Almost Ready',
      badgeClass: 'bg-blue-100 text-blue-800',
    }
  }

  if (score >= 50) {
    return {
      score,
      label: 'Needs Improvement',
      badgeClass: 'bg-yellow-100 text-yellow-800',
    }
  }

  return {
    score,
    label: 'Not Ready Yet',
    badgeClass: 'bg-red-100 text-red-800',
  }
}

function getTabStatuses(result, tailorResult, compareResult) {
  if (!result) {
    return {}
  }

  const recruiterIssues = result.ats_audit?.issues?.length ?? 0
  const criticalMissing = result.critical_missing_skills?.length ?? 0
  const unresolvedGaps = tailorResult?.tailoring_plan?.unresolved_gaps?.length ?? 0
  const compareCount = compareResult?.comparisons?.length ?? 0
  const suggestionCount = result.suggestions?.length ?? 0

  return {
    overview:
      criticalMissing === 0
        ? 'good'
        : criticalMissing <= 2
        ? 'warning'
        : 'danger',
    recruiter_view:
      recruiterIssues === 0
        ? 'good'
        : recruiterIssues <= 3
        ? 'warning'
        : 'danger',
    optimized_resume:
      !tailorResult
        ? 'info'
        : unresolvedGaps === 0
        ? 'good'
        : unresolvedGaps <= 2
        ? 'warning'
        : 'danger',
    compare_jobs: compareCount > 0 ? 'good' : 'info',
    deep_dive: suggestionCount > 0 ? 'info' : 'good',
  }
}

  export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [lastSubmission, setLastSubmission] = useState(null)

  const [tailorResult, setTailorResult] = useState(null)
  const [tailoring, setTailoring] = useState(false)
  const [tailorError, setTailorError] = useState('')

  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState('')
  const [compareResult, setCompareResult] = useState(null)

  const applyReadiness = getApplyReadiness(result, tailorResult)
  const tabStatuses = getTabStatuses(result, tailorResult, compareResult)

  const [activeDashboardTab, setActiveDashboardTab] = useState('overview')
  
  const [formResetKey, setFormResetKey] = useState(0)
  const [visitorCount, setVisitorCount] = useState(null)
  const hasRegisteredVisit = useRef(false)

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('hirefit-theme')
    return saved || 'light'
  })

  const handleAnalyze = async (formData) => {
    try {
      setLoading(true)
      setError('')
      setResult(null)
      setTailorResult(null)
      setTailorError('')
      setCompareError('')
      setCompareResult(null)

      setLastSubmission(cloneFormData(formData))
      setActiveDashboardTab('overview')

      const data = await analyzeResume(formData)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to analyze resume.')
    } finally {
      setLoading(false)
    }
  }

    useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('hirefit-theme', theme)
  }, [theme])

  useEffect(() => {
    const registerVisitor = async () => {
      if (hasRegisteredVisit.current) return
      hasRegisteredVisit.current = true

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matcher/visitor-count/increment`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to update visitor count')
        }

        const data = await response.json()
        setVisitorCount(data.count)
      } catch (error) {
        console.error('Visitor counter error:', error)
      }
    }

    registerVisitor()
  }, [])

  const handleTailorResume = async () => {
    if (!lastSubmission) {
      setTailorError('Please analyze the resume first.')
      return
    }

    try {
      setTailoring(true)
      setTailorError('')
      setTailorResult(null)

      const data = await tailorResume(cloneFormData(lastSubmission))
      setTailorResult(data)
    } catch (err) {
      setTailorError(err.message || 'Failed to generate optimized resume draft.')
    } finally {
      setTailoring(false)
    }
  }

  const toggleTheme = () => {
  setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
}


  const handleClearCompare = () => {
  setCompareLoading(false)
  setCompareError('')
  setCompareResult(null)
}

  const handleCompareMultipleJDs = async (jobDescriptions) => {
    if (!lastSubmission) {
      setCompareError('Please analyze the resume first.')
      return
    }

    try {
      setCompareLoading(true)
      setCompareError('')
      setCompareResult(null)

      const compareFormData = new FormData()
      compareFormData.append('resume', lastSubmission.get('resume'))
      compareFormData.append('job_descriptions_json', JSON.stringify(jobDescriptions))

      const data = await compareMultipleJDs(compareFormData)
      setCompareResult(data)
    } catch (err) {
      setCompareError(err.message || 'Failed to compare resume across job descriptions.')
    } finally {
      setCompareLoading(false)
    }
  }

 const handleReset = () => {
  setResult(null)
  setError('')
  setLoading(false)

  setTailorResult(null)
  setTailorError('')
  setTailoring(false)

  setCompareLoading(false)
  setCompareError('')
  setCompareResult(null)

  setLastSubmission(null)

  setFormResetKey((prev) => prev + 1)
  setActiveDashboardTab('overview')

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

  const dashboardTabs = result
    ? [
        {
          key: 'overview',
          label: 'Overview',
          status: tabStatuses.overview,
          content: (
            <div className="space-y-6">
              <SummaryHero
                filename={result.filename}
                scores={result.scores}
                analysisMeta={result.analysis_meta}
                actions={
                  <ActionBar
  suggestions={result.suggestions}
  onReset={handleReset}
  result={result}
  tailorResult={tailorResult}
  applyReadiness={applyReadiness}
/>
                }
              />

              <CollapsibleSection key="overview-score" title="Score Overview" defaultOpen>
                <ProgressBarCard scores={result.scores} />
              </CollapsibleSection>  
              <CollapsibleSection key="overview-skills" title="Matched vs Missing Skills" defaultOpen>
                <SkillsSection
                  matchedSkills={result.matched_skills}
                  missingSkills={result.missing_skills}
                  criticalMissingSkills={result.critical_missing_skills}
                />
              </CollapsibleSection>

              <CollapsibleSection key="overview-experience" title="Experience Alignment" defaultOpen>
                <ExperiencePanel
                  experienceEstimate={result.experience_estimate}
                  experienceComparison={result.experience_comparison}
                  jdRequirements={result.jd_requirements}
                />
              </CollapsibleSection>
            </div>
          ),
        },
  {
  key: 'recruiter_view',
  label: 'Recruiter View',
  status: tabStatuses.recruiter_view,
  content: (
    <div className="space-y-8">
      {result.ats_audit && (
        <CollapsibleSection
          key="recruiter-ats"
          title="ATS Formatting Audit"
          defaultOpen
        >
          <ATSAuditPanel atsAudit={result.ats_audit} />
        </CollapsibleSection>
      )}

      {result.keyword_coverage && result.keyword_coverage.items?.length > 0 && (
        <CollapsibleSection
          key="recruiter-keyword"
          title="Evidence-Backed Keyword Coverage"
          defaultOpen
        >
          <KeywordCoveragePanel keywordCoverage={result.keyword_coverage} />
        </CollapsibleSection>
      )}

      {result.shortlist_simulation &&
        ((result.shortlist_simulation.reasons?.length ?? 0) > 0 ||
          (result.shortlist_simulation.action_plan?.length ?? 0) > 0) && (
          <CollapsibleSection
            key="recruiter-shortlist"
            title="Why-Not-Shortlisted Simulator"
            defaultOpen
          >
            <ShortlistRiskPanel
              shortlistSimulation={result.shortlist_simulation}
            />
          </CollapsibleSection>
        )}
    </div>
  ),
},
        {
          key: 'optimized_resume',
          label: 'Optimized Resume',
          status: tabStatuses.optimized_resume,
          content: (
            <div className="space-y-8">
              <TailorResumeButton
                onClick={handleTailorResume}
                loading={tailoring}
                disabled={!lastSubmission}
              />

              {tailoring && <LoadingSpinner />}

              {tailorError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow">
                  {tailorError}
                </div>
              )}

              {!tailorResult && !tailoring && (
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <p className="text-sm text-gray-600">
                    Generate a safer JD-optimized resume draft using only supported resume evidence.
                  </p>
                </div>
              )}

              {tailorResult && (
                <div className="space-y-8">
                  <ManualReviewBanner notice={tailorResult.manual_review_notice} />

                  <ExportTailoredResumeButtons tailorResult={tailorResult} />

                  <CollapsibleSection key="optimized-before-after" title="Before vs After Optimization" defaultOpen>
                    <TailorComparisonPanel tailorResult={tailorResult} />
                  </CollapsibleSection>

                  <CollapsibleSection key="optimized-preview" title="Optimized Resume Draft Preview" defaultOpen>
                    <TailoredResumePanel tailoredResume={tailorResult.tailored_resume} />
                  </CollapsibleSection>

                  <CollapsibleSection key="optimized-gaps" title="Unresolved Gaps and Validation" defaultOpen>
                    <UnresolvedGapsPanel tailorResult={tailorResult} />
                  </CollapsibleSection>
                </div>
              )}
            </div>
          ),
        },
        {
          key: 'compare_jobs',
          label: 'Compare Jobs',
          status: tabStatuses.compare_jobs,
          content: (
            <div className="space-y-8">
              {compareError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow">
                  {compareError}
                </div>
              )}

              <MultiJDComparePanel
                key={`compare-${formResetKey}`}
                onCompare={handleCompareMultipleJDs}
                onClear={handleClearCompare}
                loading={compareLoading}
                compareResult={compareResult}
                resetKey={formResetKey}
              />
            </div>
          ),
        },
        {
          key: 'deep_dive',
          label: 'Deep Dive',
          status: tabStatuses.deep_dive,
          content: (
            <div className="space-y-8">
              <CollapsibleSection key="deep-jd" title="Job Description Requirements" defaultOpen>
                <JDRequirementsCard jdRequirements={result.jd_requirements} />
              </CollapsibleSection>

              <CollapsibleSection key="deep-categorized" title="Categorized Skills" defaultOpen={false}>
                <CategorizedSkillsPanel
                  categorizedResumeSkills={result.categorized_resume_skills}
                  categorizedJdSkills={result.categorized_jd_skills}
                />
              </CollapsibleSection>

              <CollapsibleSection key="deep-evidence-summary" title="Evidence Strength Summary" defaultOpen>
                <EvidencePanel evidenceSummary={result.evidence_summary} />
              </CollapsibleSection>

              <CollapsibleSection key="deep-evidence-details" title="Detailed Skill Evidence" defaultOpen={false}>
                <EvidenceDetailsPanel skillEvidenceMap={result.skill_evidence_map} />
              </CollapsibleSection>

              <CollapsibleSection key="deep-ai" title="AI Explanation and Suggestions" defaultOpen>
                <div className="space-y-8">
                  <LLMExplanationPanel explanation={result.llm_explanation} />
                  <SuggestionsSection suggestions={result.suggestions} />
                </div>
              </CollapsibleSection>
            </div>
          ),
        },
      ]
    : []
      const activeTabContent =
    dashboardTabs.find((tab) => tab.key === activeDashboardTab)?.content || null
    
  return (
    <div
  className={`min-h-screen px-4 py-10 pb-28 transition-colors duration-300 ${
    theme === 'dark'
      ? 'bg-slate-950 text-white'
      : 'bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900'
  }`}
>
    <div className="mx-auto max-w-7xl space-y-8">
  <div className="space-y-4">
    <div className="relative flex justify-center">
      <AppBrand onClick={handleReset} />

      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
    </div>

    {result && (
      <ResultTabs
        key={`tabs-${formResetKey}`}
        tabs={dashboardTabs}
        defaultTabKey="overview"
        activeTabKey={activeDashboardTab}
        onTabChange={setActiveDashboardTab}
        renderContent={false}
      />
    )}
  </div>

  {(activeDashboardTab === 'overview' || !result) && (
    <UploadForm
      key={`upload-${formResetKey}`}
      onAnalyze={handleAnalyze}
      loading={loading}
      resetKey={formResetKey}
    />
  )}

  {!loading && !error && !result && <EmptyState />}

  {loading && <LoadingSpinner />}

  {error && (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow">
      {error}
    </div>
  )}

  {result && activeDashboardTab === 'overview' && (
    <MiniSummaryCards
      result={result}
      tailorResult={tailorResult}
      applyReadiness={applyReadiness}
    />
  )}

  {result && (
  <div key={`${activeDashboardTab}-${result.filename}`}>
    {activeTabContent}
  </div>
)}
</div>

      <footer
  className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-sm transition-colors duration-300 ${
    theme === 'dark'
      ? 'border-slate-800 bg-slate-950/95'
      : 'border-gray-300 bg-white/95'
  }`}
>
  <div
    className={`mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 py-3 text-center text-sm sm:flex-row sm:gap-4 ${
      theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
    }`}
  >
    <span className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-gray-800'}>
      Created by JATIN SHUKLA 
    </span>
    <span className={theme === 'dark' ? 'hidden sm:inline text-slate-500' : 'hidden sm:inline text-gray-400'}>
      •
    </span>
    <span>
      Visitors till date:{' '}
      <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
        {visitorCount !== null ? visitorCount : '...'}
      </strong>
    </span>
  </div>
</footer>
    </div>
  )
}