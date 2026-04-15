const JOB_HINT_WORDS = [
  'responsibilities',
  'requirements',
  'qualifications',
  'skills',
  'experience',
  'preferred',
  'must have',
  'nice to have',
  'role',
  'job description',
  'about the role',
  'what you will do',
  'what we are looking for',
  'eligibility',
  'candidate',
]

const HTML_PATTERN =
  /<\/?(html|head|body|div|span|script|style|meta|link|svg|path|iframe|noscript|button|input|form)[^>]*>/i

const CODE_PATTERN =
  /(function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|<script|<\/script>|import\s+\w+|export\s+default|class\s+\w+)/i

export function validateResumeFile(file) {
  if (!file) return 'Please select a resume file.'

  const allowed = ['.pdf', '.docx']
  const lower = file.name.toLowerCase()
  const valid = allowed.some((ext) => lower.endsWith(ext))

  if (!valid) {
    return 'Only PDF and DOCX resume files are supported.'
  }

  return ''
}

export function validateJobDescriptionInput(value) {
  const text = (value || '').trim()

  if (!text) {
    return 'Please paste a job description.'
  }

  if (text.length < 120) {
    return 'The pasted content looks too short to be a proper job description.'
  }

  const htmlTags = text.match(/<[^>]+>/g) || []
  if (HTML_PATTERN.test(text) || htmlTags.length >= 3) {
    return 'The pasted content looks like HTML or webpage markup. Paste only clean JD text.'
  }

  if (CODE_PATTERN.test(text)) {
    return 'The pasted content looks like code or script text, not a job description.'
  }

  const lower = text.toLowerCase()
  const hits = JOB_HINT_WORDS.filter((word) => lower.includes(word)).length

  if (hits < 2) {
    return 'This does not look like a normal job description. Paste a JD with role, requirements, responsibilities, skills, or qualifications.'
  }

  return ''
}