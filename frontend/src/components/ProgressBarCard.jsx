const scoreItems = [
  {
    key: 'required_skill_score',
    label: 'Required Skill Score',
    helper: 'How well you match the must-have skills in the JD.',
  },
  {
    key: 'preferred_skill_score',
    label: 'Preferred Skill Score',
    helper: 'How well you match the good-to-have or preferred skills.',
  },
  {
    key: 'general_skill_score',
    label: 'General Skill Score',
    helper: 'How well your resume matches overall JD skill terms.',
  },
  {
    key: 'weighted_skill_score',
    label: 'Weighted Skill Score',
    helper: 'Combined skill score with more weight on important skills.',
  },
  {
    key: 'semantic_score',
    label: 'Semantic Score',
    helper: 'How similar your resume content is to the JD overall.',
  },
  {
    key: 'section_evidence_score',
    label: 'Section Evidence Score',
    helper: 'How well your skills are supported across resume sections.',
  },
  {
    key: 'skill_support_score',
    label: 'Skill Support Score',
    helper: 'How strongly your claimed skills are backed by resume evidence.',
  },
  {
    key: 'critical_missing_penalty',
    label: 'Critical Missing Penalty',
    helper: 'Penalty for missing important required skills in the JD.',
  },
]

function getScoreTone(key, value) {
  const safeValue = Math.max(0, Math.min(Number(value) || 0, 100))

  if (key === 'critical_missing_penalty') {
    if (safeValue <= 10) {
      return {
        chip: 'bg-green-100 text-green-700',
        fill: 'bg-green-600',
        track: 'bg-green-100',
        label: 'Low Penalty',
      }
    }

    if (safeValue <= 25) {
      return {
        chip: 'bg-yellow-100 text-yellow-700',
        fill: 'bg-yellow-500',
        track: 'bg-yellow-100',
        label: 'Medium Penalty',
      }
    }

    return {
      chip: 'bg-red-100 text-red-700',
      fill: 'bg-red-500',
      track: 'bg-red-100',
      label: 'High Penalty',
    }
  }

  if (safeValue >= 75) {
    return {
      chip: 'bg-green-100 text-green-700',
      fill: 'bg-green-600',
      track: 'bg-green-100',
      label: 'Strong',
    }
  }

  if (safeValue >= 50) {
    return {
      chip: 'bg-blue-100 text-blue-700',
      fill: 'bg-blue-600',
      track: 'bg-blue-100',
      label: 'Moderate',
    }
  }

  if (safeValue >= 25) {
    return {
      chip: 'bg-yellow-100 text-yellow-700',
      fill: 'bg-yellow-500',
      track: 'bg-yellow-100',
      label: 'Low',
    }
  }

  return {
    chip: 'bg-red-100 text-red-700',
    fill: 'bg-red-500',
    track: 'bg-red-100',
    label: 'Weak',
  }
}

function ScoreMetricCard({ scoreKey, label, helper, value }) {
  const safeValue = Math.max(0, Math.min(Number(value) || 0, 100))
  const tone = getScoreTone(scoreKey, safeValue)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold leading-none text-gray-900">
            {safeValue}%
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.chip}`}
        >
          {tone.label}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-500">
        {helper}
      </p>

      <div className={`mt-4 h-3 w-full overflow-hidden rounded-full ${tone.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${tone.fill}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}

export default function ProgressBarCard({ scores }) {
  if (!scores) return null

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Detailed Scores</h2>
          <p className="mt-1 text-sm text-gray-600">
            A clearer breakdown of what is helping or hurting your match.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {scoreItems.map((item) => (
          <ScoreMetricCard
            key={item.key}
            scoreKey={item.key}
            label={item.label}
            helper={item.helper}
            value={scores[item.key]}
          />
        ))}
      </div>
    </div>
  )
}