export default function ActionBar({
  suggestions = [],
  onReset,
  result,
  tailorResult,
  applyReadiness,
}) {
  const handleCopySuggestions = async () => {
    if (!result) return

    const fitScore = result.scores?.overall_score ?? 0
    const fitLabel = result.scores?.fit_label || 'Unknown'
    const atsScore = result.ats_audit?.score ?? 0
    const atsGrade = result.ats_audit?.grade || 'Unknown'
    const readinessScore = applyReadiness?.score ?? 0
    const readinessLabel = applyReadiness?.label || 'Unknown'

    const matchedSkills = result.matched_skills || []
    const missingSkills = result.missing_skills || []
    const criticalMissingSkills = result.critical_missing_skills || []
    const quickFixes = result.ats_audit?.quick_fixes || []
    const optimizedScore = tailorResult?.analysis_after?.overall_score ?? null

    const lines = [
      'HireFit Resume Improvement Plan',
      '',
      'Current Snapshot',
      `- Fit Score: ${fitScore}% (${fitLabel})`,
      `- Readiness Score: ${readinessScore} (${readinessLabel})`,
      `- ATS Format Score: ${atsScore} (${atsGrade})`,
      `- Critical Gaps: ${criticalMissingSkills.length}`,
      optimizedScore !== null
        ? `- Optimized Score: ${optimizedScore}%`
        : '- Optimized Score: Not generated yet',
      '',
      'What this means',
      '- Fit Score shows how well your current resume content matches this specific job.',
      '- Readiness Score shows how ready your resume looks to apply right now.',
      '- ATS Format Score reflects formatting quality, not job-fit by itself.',
      '',
      'Top Resume Strengths',
      ...(matchedSkills.length
        ? matchedSkills.slice(0, 8).map((skill) => `- ${skill}`)
        : ['- No strong matched skills detected yet.']),
      '',
      'Top Gaps To Fix',
      ...(criticalMissingSkills.length
        ? criticalMissingSkills.map((skill) => `- Critical gap: ${skill}`)
        : ['- No critical gaps detected.']),
      ...(missingSkills.length
        ? missingSkills
            .filter((skill) => !criticalMissingSkills.includes(skill))
            .slice(0, 8)
            .map((skill) => `- Missing skill / keyword: ${skill}`)
        : []),
      '',
      'Recommended Resume Actions',
      ...(suggestions.length
        ? suggestions.map((item, index) => `${index + 1}. ${item}`)
        : ['1. Improve your resume based on the missing skills and job-specific requirements.']),
      '',
      'ATS / Formatting Fixes',
      ...(quickFixes.length
        ? quickFixes.map((fix, index) => `${index + 1}. ${fix}`)
        : ['1. No major ATS formatting fixes suggested.']),
      '',
      'Manual Review Reminder',
      '- Review every change manually before using the resume.',
      '- Do not add skills or experience you do not actually have.',
      '- Prefer rewriting existing bullets to better reflect relevant work and projects.',
    ]

    const text = lines.join('\n')
    await navigator.clipboard.writeText(text)
    alert('Improvement plan copied to clipboard.')
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={handleCopySuggestions}
        className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Copy Improvement Plan
      </button>

      <button
        type="button"
        onClick={onReset}
        className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Analyze Another Resume
      </button>
    </div>
  )
}