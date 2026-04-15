function ComparisonCard({ title, score, fitLabel }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{score}%</p>
      <p className="mt-2 text-sm font-medium text-gray-700">{fitLabel}</p>
    </div>
  )
}

export default function TailorComparisonPanel({ tailorResult }) {
  if (!tailorResult) return null

  const before = tailorResult.analysis_before
  const after = tailorResult.analysis_after
  const delta = tailorResult.score_delta

  const deltaClass =
    delta > 0
      ? 'bg-green-100 text-green-800'
      : delta < 0
      ? 'bg-red-100 text-red-800'
      : 'bg-gray-100 text-gray-800'

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        

        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${deltaClass}`}>
          Score Change: {delta >= 0 ? '+' : ''}{delta}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ComparisonCard
          title="Before Optimization"
          score={before.overall_score}
          fitLabel={before.fit_label}
        />
        <ComparisonCard
          title="After Optimization"
          score={after.overall_score}
          fitLabel={after.fit_label}
        />
      </div>
    </div>
  )
}