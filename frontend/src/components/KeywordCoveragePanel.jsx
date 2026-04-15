function statusClass(status) {
  if (status === 'strong') return 'bg-green-100 text-green-800'
  if (status === 'medium') return 'bg-blue-100 text-blue-800'
  if (status === 'weak') return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function priorityClass(priority) {
  if (priority === 'required') return 'text-red-700'
  if (priority === 'preferred') return 'text-blue-700'
  return 'text-gray-700'
}

export default function KeywordCoveragePanel({ keywordCoverage }) {
  if (!keywordCoverage || !keywordCoverage.items?.length) {
    return <p className="text-sm text-gray-500">No keyword coverage available.</p>
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-800">
          Strong: {keywordCoverage.summary?.strong_count ?? 0}
        </span>
        <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-800">
          Medium: {keywordCoverage.summary?.medium_count ?? 0}
        </span>
        <span className="rounded-full bg-yellow-100 px-3 py-1 font-semibold text-yellow-800">
          Weak: {keywordCoverage.summary?.weak_count ?? 0}
        </span>
        <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-800">
          Missing: {keywordCoverage.summary?.missing_count ?? 0}
        </span>
      </div>

      <div className="grid gap-3">
        {keywordCoverage.items.map((item, index) => (
          <div
            key={`${item.skill}-${item.priority}-${index}`}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className={`font-semibold ${priorityClass(item.priority)}`}>
                {item.skill}
              </h3>

              <div className="flex gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
                  {item.priority}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Evidence Sections:{' '}
              {item.evidence_sections?.length ? item.evidence_sections.join(', ') : 'None'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}