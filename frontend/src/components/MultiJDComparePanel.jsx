import { useEffect, useState } from 'react'

export default function MultiJDComparePanel({
  onCompare,
  onClear,
  loading,
  compareResult,
  resetKey,
}) {
  const [jd1, setJd1] = useState('')
  const [jd2, setJd2] = useState('')
  const [jd3, setJd3] = useState('')

  useEffect(() => {
    setJd1('')
    setJd2('')
    setJd3('')
  }, [resetKey])

  const handleCompare = () => {
    const jds = [jd1, jd2, jd3].map((x) => x.trim()).filter(Boolean)
    if (!jds.length) {
      alert('Please paste at least one job description.')
      return
    }
    onCompare(jds)
  }

  const handleClearAll = () => {
    setJd1('')
    setJd2('')
    setJd3('')
    onClear?.()
  }

  return (
    <div className="space-y-6 rounded-2xl bg-white p-6 shadow-lg">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Multi-JD Comparison</h2>
        <p className="mt-2 text-sm text-gray-600">
          Compare the same resume against multiple job descriptions and rank the best-fit opportunities.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <textarea
          rows="8"
          value={jd1}
          onChange={(e) => setJd1(e.target.value)}
          placeholder="Paste Job Description 1"
          className="rounded-xl border border-gray-300 p-3 text-sm"
        />
        <textarea
          rows="8"
          value={jd2}
          onChange={(e) => setJd2(e.target.value)}
          placeholder="Paste Job Description 2"
          className="rounded-xl border border-gray-300 p-3 text-sm"
        />
        <textarea
          rows="8"
          value={jd3}
          onChange={(e) => setJd3(e.target.value)}
          placeholder="Paste Job Description 3"
          className="rounded-xl border border-gray-300 p-3 text-sm"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleClearAll}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear All
        </button>

        <button
          type="button"
          onClick={handleCompare}
          disabled={loading}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Comparing...' : 'Compare Resume Across JDs'}
        </button>
      </div>

      {compareResult && (
        <div className="space-y-4">
          {compareResult.best_match && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <h3 className="font-semibold text-green-900">Best Match</h3>
              <p className="mt-1 text-sm text-green-800">
                {compareResult.best_match.jd_title} — {compareResult.best_match.overall_score}% ({compareResult.best_match.fit_label})
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {compareResult.comparisons?.map((item, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 p-4">
                <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-semibold text-gray-900">{item.jd_title}</h3>
                  <span className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
                    {item.overall_score}%
                  </span>
                </div>

                <p className="text-sm text-gray-600">Fit Label: {item.fit_label}</p>
                <p className="text-sm text-gray-600">Required Skill Score: {item.required_skill_score}%</p>
                <p className="text-sm text-gray-600">Skill Support Score: {item.skill_support_score}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}