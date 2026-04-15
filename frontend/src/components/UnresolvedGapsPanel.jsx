function PillList({ items, colorClass, emptyText }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-full px-3 py-1 text-sm font-medium ${colorClass}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function UnresolvedGapsPanel({ tailorResult }) {
  if (!tailorResult) return null

  const plan = tailorResult.tailoring_plan
  const validation = tailorResult.validation
  const tailoredResume = tailorResult.tailored_resume

  const safeClass = validation.safe_to_export
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'

  const safeText = validation.safe_to_export
    ? 'Draft Looks Safe to Review'
    : 'Draft Needs Manual Correction'

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Unresolved Gaps</h2>
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${safeClass}`}>
            {safeText}
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">
              Still Missing / Cannot Be Claimed
            </h3>
            <PillList
              items={plan.unresolved_gaps}
              colorClass="bg-red-100 text-red-800"
              emptyText="No unresolved gaps found."
            />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">
              Not Allowed To Add
            </h3>
            <PillList
              items={plan.skills_not_allowed_to_add}
              colorClass="bg-yellow-100 text-yellow-800"
              emptyText="No blocked skills."
            />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">
              Unsupported Added Terms
            </h3>
            <PillList
              items={validation.unsupported_added_terms}
              colorClass="bg-red-100 text-red-800"
              emptyText="No unsupported added terms detected."
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Validation & Review Notes
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">
              Manual Review Note
            </h3>
            <p className="rounded-xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-900">
              {tailoredResume.manual_review_note || tailorResult.manual_review_notice}
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">
              Validator Notes
            </h3>
            {validation.validator_notes?.length > 0 ? (
              <ul className="space-y-2">
                {validation.validator_notes.map((note, index) => (
                  <li
                    key={index}
                    className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No validator notes available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}