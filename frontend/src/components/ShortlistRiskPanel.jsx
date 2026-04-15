function verdictClass(verdict) {
  if (verdict.toLowerCase().includes('high')) return 'bg-red-100 text-red-800'
  if (verdict.toLowerCase().includes('moderate')) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

function reasonCardClass(verdict) {
  if (verdict.toLowerCase().includes('high')) return 'bg-red-50 text-red-900'
  if (verdict.toLowerCase().includes('moderate')) return 'bg-yellow-50 text-yellow-900'
  return 'bg-blue-50 text-blue-900'
}

export default function ShortlistRiskPanel({ shortlistSimulation }) {
  if (
    !shortlistSimulation ||
    (!(shortlistSimulation.reasons?.length) && !(shortlistSimulation.action_plan?.length))
  ) {
    return <p className="text-sm text-gray-500">No shortlist simulation available.</p>
  }

  const cardClass = reasonCardClass(shortlistSimulation.verdict || '')

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${verdictClass(shortlistSimulation.verdict || '')}`}>
            {shortlistSimulation.verdict}
          </span>
        </div>

        <div className="space-y-3">
          {shortlistSimulation.reasons?.map((reason, index) => (
            <div key={index} className={`rounded-xl p-4 text-sm ${cardClass}`}>
              {reason}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recommended Next Actions</h3>

        <div className="space-y-3">
          {shortlistSimulation.action_plan?.map((item, index) => (
            <div key={index} className="rounded-xl bg-white p-4 text-sm text-gray-700 border border-gray-200">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}