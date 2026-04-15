export default function TailorResumeButton({ onClick, loading, disabled }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Generate Optimized Resume Draft
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            This creates a safer JD-optimized draft using your existing resume evidence.
            Review it manually and do not depend completely on the app.
          </p>
        </div>

        <button
          type="button"
          onClick={onClick}
          disabled={loading || disabled}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Generating Draft...' : 'Generate Optimized Resume Draft'}
        </button>
      </div>
    </div>
  )
}