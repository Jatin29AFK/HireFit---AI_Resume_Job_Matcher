function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  )
}

function normalizeLines(items = []) {
  return items
    .flatMap((item) => {
      const text = (item || '')
        .replace(/∗/g, '\n* ')
        .replace(/•/g, '\n* ')
        .replace(/\s+\*\s*/g, '\n* ')
      return text.split('\n')
    })
    .map((line) => line.trim())
    .filter(Boolean)
}

function cleanText(text) {
  return text
    .replace(/^\*\s*/, '')
    .replace(/^•\s*/, '')
    .replace(/^[–-]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isExplicitBullet(line) {
  return line.startsWith('*') || line.startsWith('•')
}

function looksLikeDateOrLocation(text) {
  const value = text.toLowerCase()
  return (
    /\b(19|20)\d{2}\b/.test(value) ||
    /present/.test(value) ||
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/.test(value) ||
    /\b(noida|pune|gurugram|bangalore|hyderabad|delhi|remote|india|punjab|u\.p\.)\b/.test(value)
  )
}

function isLikelyHeader(text) {
  const value = cleanText(text)
  if (!value) return false
  if (value.endsWith('.')) return false
  if (looksLikeDateOrLocation(value)) return false
  return value.length <= 90
}

function parseStructuredEntries(items = []) {
  const lines = normalizeLines(items)
  const sections = []

  let pendingHeaders = []
  let current = null

  const ensureCurrent = () => {
    if (!current) {
      current = {
        title: pendingHeaders[0] || '',
        meta: pendingHeaders.slice(1),
        bullets: [],
      }
      pendingHeaders = []
    }
  }

  const flushCurrent = () => {
    if (!current) return
    if (current.title || current.meta.length || current.bullets.length) {
      sections.push(current)
    }
    current = null
  }

  for (const rawLine of lines) {
    const cleaned = cleanText(rawLine)
    if (!cleaned) continue

    if (isExplicitBullet(rawLine)) {
      ensureCurrent()
      current.bullets.push(cleaned)
      continue
    }

    if (looksLikeDateOrLocation(cleaned)) {
      pendingHeaders.push(cleaned)
      continue
    }

    if (isLikelyHeader(rawLine)) {
      if (current && current.bullets.length > 0) {
        flushCurrent()
      }
      pendingHeaders.push(cleaned)
      continue
    }

    ensureCurrent()
    current.bullets.push(cleaned)
  }

  if (!current && pendingHeaders.length) {
    current = {
      title: pendingHeaders[0] || '',
      meta: pendingHeaders.slice(1),
      bullets: [],
    }
  }

  flushCurrent()

  return sections.filter(
    (section) => section.title || section.meta.length || section.bullets.length
  )
}

function StructuredExperienceList({ items, emptyText }) {
  const sections = parseStructuredEntries(items)

  if (!sections.length) {
    return <p className="text-sm text-gray-500">{emptyText}</p>
  }

  return (
    <div className="space-y-5">
      {sections.map((section, index) => (
        <div key={index} className="rounded-xl bg-gray-50 p-4">
          {section.title ? (
            <h4 className="text-sm font-semibold text-gray-900">
              {section.title}
            </h4>
          ) : null}

          {section.meta?.length ? (
            <p className="mt-1 text-xs text-gray-500">
              {section.meta.join(' | ')}
            </p>
          ) : null}

          {section.bullets?.length ? (
            <ul className="mt-3 space-y-2">
              {section.bullets.map((bullet, bulletIndex) => (
                <li
                  key={bulletIndex}
                  className="flex items-start gap-3 text-sm leading-6 text-gray-700"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                  <p>{bullet}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default function TailoredResumePanel({ tailoredResume }) {
  if (!tailoredResume) return null

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="space-y-5">
        <SectionCard title="Headline">
          <p className="text-base font-medium text-gray-800">
            {tailoredResume.headline || 'No headline generated.'}
          </p>
        </SectionCard>

        <SectionCard title="Summary">
          <p className="text-sm leading-6 text-gray-700">
            {tailoredResume.summary || 'No summary generated.'}
          </p>
        </SectionCard>

        <SectionCard title="Skills">
          {tailoredResume.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tailoredResume.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No skills generated.</p>
          )}
        </SectionCard>

        <SectionCard title="Experience">
          <StructuredExperienceList
            items={tailoredResume.experience_bullets}
            emptyText="No experience content generated."
          />
        </SectionCard>

        <SectionCard title="Projects">
          <StructuredExperienceList
            items={tailoredResume.project_bullets}
            emptyText="No project content generated."
          />
        </SectionCard>

        <SectionCard title="Change Log">
          <ul className="space-y-2">
            {(tailoredResume.change_log || []).map((item, index) => (
              <li key={index} className="text-sm leading-6 text-gray-700">
                • {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}