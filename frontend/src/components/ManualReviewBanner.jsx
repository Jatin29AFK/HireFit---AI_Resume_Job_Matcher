export default function ManualReviewBanner({ notice }) {
  if (!notice) return null

  return (
    <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-5 shadow-lg">
      <h2 className="text-lg font-semibold text-yellow-900">Manual Review Required</h2>
      <p className="mt-2 text-sm leading-6 text-yellow-800">{notice}</p>

      <ul className="mt-4 space-y-2 text-sm text-yellow-800">
        <li>• Review every bullet before using the resume.</li>
        <li>• Do not depend completely on the app.</li>
        <li>• Remove anything that feels exaggerated or unsupported.</li>
      </ul>
    </div>
  )
}