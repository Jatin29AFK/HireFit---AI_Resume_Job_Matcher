import { useState } from 'react'

function cleanEvidenceLine(line = '') {
  return line
    .replace(/^[\s•*\-–∗]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function EvidenceLineCard({ line }) {
  const cleaned = cleanEvidenceLine(line)

  if (!cleaned) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
      {cleaned}
    </div>
  )
}

function EvidenceItem({ skill, info }) {
  const [open, setOpen] = useState(false)

  const badgeClass =
    info.evidence_strength === 'strong'
      ? 'bg-green-100 text-green-800'
      : info.evidence_strength === 'medium'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800'

  const cleanLines =
    info.supporting_lines?.map(cleanEvidenceLine).filter(Boolean) || []

  return (
    <div className="rounded-2xl border border-gray-200 p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{skill}</h3>
          <p className="mt-1 text-sm text-gray-600">
            Found in: {info.mentioned_in?.length ? info.mentioned_in.join(', ') : 'N/A'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${badgeClass}`}>
            {info.evidence_strength}
          </span>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {open ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          {cleanLines.length > 0 ? (
            cleanLines.map((line, index) => (
              <EvidenceLineCard
                key={`${skill}-${index}`}
                line={line}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No supporting evidence found.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function EvidenceDetailsPanel({ skillEvidenceMap }) {
  if (!skillEvidenceMap || Object.keys(skillEvidenceMap).length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <p className="text-sm text-gray-500">No evidence details available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="space-y-4">
        {Object.entries(skillEvidenceMap).map(([skill, info]) => (
          <EvidenceItem key={skill} skill={skill} info={info} />
        ))}
      </div>
    </div>
  )
}