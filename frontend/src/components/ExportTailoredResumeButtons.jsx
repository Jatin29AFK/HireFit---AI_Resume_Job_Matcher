import { jsPDF } from 'jspdf'

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}

function buildTailoredResumeText(tailorResult) {
  const resume = tailorResult?.tailored_resume
  if (!resume) return ''

  const sections = [
    resume.headline ? `${resume.headline}\n` : '',
    resume.summary ? `SUMMARY\n${resume.summary}\n` : '',
    resume.skills?.length ? `SKILLS\n${resume.skills.join(', ')}\n` : '',
    resume.experience_bullets?.length
      ? `EXPERIENCE\n${resume.experience_bullets.map((item) => `• ${item}`).join('\n')}\n`
      : '',
    resume.project_bullets?.length
      ? `PROJECTS\n${resume.project_bullets.map((item) => `• ${item}`).join('\n')}\n`
      : '',
    resume.change_log?.length
      ? `CHANGE LOG\n${resume.change_log.map((item) => `• ${item}`).join('\n')}\n`
      : '',
  ]

  return sections.filter(Boolean).join('\n').trim()
}

function buildDocHtml(tailorResult) {
  const resume = tailorResult?.tailored_resume
  if (!resume) return ''

  const bulletList = (items = []) =>
    items.length ? `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>optimized_resume</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            padding: 32px;
            color: #111827;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 8px;
          }
          h2 {
            font-size: 16px;
            margin-top: 24px;
            margin-bottom: 8px;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 4px;
          }
          p, li {
            font-size: 12px;
          }
          ul {
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        ${resume.headline ? `<h1>${resume.headline}</h1>` : ''}
        ${resume.summary ? `<h2>Summary</h2><p>${resume.summary}</p>` : ''}
        ${resume.skills?.length ? `<h2>Skills</h2><p>${resume.skills.join(', ')}</p>` : ''}
        ${resume.experience_bullets?.length ? `<h2>Experience</h2>${bulletList(resume.experience_bullets)}` : ''}
        ${resume.project_bullets?.length ? `<h2>Projects</h2>${bulletList(resume.project_bullets)}` : ''}
        ${resume.change_log?.length ? `<h2>Change Log</h2>${bulletList(resume.change_log)}` : ''}
      </body>
    </html>
  `.trim()
}

function exportPdfFromText(filename, text) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  const maxWidth = pageWidth - margin * 2
  const lineHeight = 18

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)

  let y = margin
  const lines = doc.splitTextToSize(text, maxWidth)

  lines.forEach((line) => {
    if (y > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
    doc.text(line, margin, y)
    y += lineHeight
  })

  doc.save(filename)
}

export default function ExportTailoredResumeButtons({ tailorResult }) {
  if (!tailorResult?.tailored_resume) return null

  const handleExportTXT = () => {
    const text = buildTailoredResumeText(tailorResult)
    downloadBlob(text, 'optimized_resume.txt', 'text/plain;charset=utf-8')
  }

  const handleExportDOC = () => {
    const html = buildDocHtml(tailorResult)
    downloadBlob(html, 'optimized_resume.doc', 'application/msword')
  }

  const handleExportPDF = () => {
    const text = buildTailoredResumeText(tailorResult)
    exportPdfFromText('optimized_resume.pdf', text)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Export optimized resume</p>
          <p className="text-xs text-gray-500">
            Download the current optimized draft in your preferred format.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportTXT}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Export TXT
          </button>

          <button
            type="button"
            onClick={handleExportDOC}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Export DOC
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}