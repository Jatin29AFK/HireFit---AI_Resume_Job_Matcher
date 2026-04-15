import { useEffect, useRef, useState } from 'react'
import {
  validateResumeFile,
  validateJobDescriptionInput,
} from '../utils/jdValidation'

export default function UploadForm({ onAnalyze, loading, resetKey }) {
  const fileInputRef = useRef(null)

  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [fileError, setFileError] = useState('')
  const [jdError, setJdError] = useState('')
  const [urlError, setUrlError] = useState('')
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setResumeFile(null)
    setJobDescription('')
    setJobUrl('')
    setFileError('')
    setJdError('')
    setUrlError('')
    setFetchingUrl(false)
    setIsDragging(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [resetKey])

  const applyFile = (file) => {
    setResumeFile(file)
    const error = validateResumeFile(file)
    setFileError(error)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null
    applyFile(file)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0] || null
    applyFile(file)
  }

  const handleJdChange = (event) => {
    const value = event.target.value
    setJobDescription(value)

    if (jdError) {
      setJdError(validateJobDescriptionInput(value))
    }
  }

  const handleFetchFromUrl = async () => {
    const trimmedUrl = jobUrl.trim()

    if (!trimmedUrl) {
      setUrlError('Please enter a job URL first.')
      return
    }

    try {
      setFetchingUrl(true)
      setUrlError('')
      setJdError('')

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/matcher/extract-jd-from-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: trimmedUrl }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch JD from URL.')
      }

      setJobDescription(data.job_description || '')
      setJdError('')
    } catch (error) {
      setUrlError(error.message || 'Failed to fetch JD from URL.')
    } finally {
      setFetchingUrl(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextFileError = validateResumeFile(resumeFile)
    const nextJdError = validateJobDescriptionInput(jobDescription)

    setFileError(nextFileError)
    setJdError(nextJdError)

    if (nextFileError || nextJdError) return

    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('job_description', jobDescription.trim())

    onAnalyze(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 shadow-lg">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-900">Upload Resume</label>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
            isDragging
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mb-3 rounded-full bg-white p-3 shadow-sm transition group-hover:shadow">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-gray-700 group-hover:text-blue-600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16V4M12 4L7 9M12 4L17 9M5 20H19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-sm font-medium text-gray-900">
            {resumeFile ? resumeFile.name : 'Browse or drag & drop resume'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: PDF, DOCX
          </p>
        </div>

        {fileError && (
          <p className="text-sm font-medium text-red-600">{fileError}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="job-description" className="text-sm font-semibold text-gray-900">
            Job Description
          </label>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            More reliable
          </span>
        </div>

        <textarea
          id="job-description"
          rows="10"
          value={jobDescription}
          onChange={handleJdChange}
          placeholder="Paste a clean job description here. This gives the most reliable resume-to-JD matching."
          className="w-full rounded-2xl border border-gray-300 p-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="text-xs text-green-700">
          Pasting the JD manually gives the most reliable analysis and is recommended whenever possible.
        </p>

        {jdError && (
          <p className="text-sm font-medium text-red-600">{jdError}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="job-url" className="text-sm font-semibold text-gray-900">
            Job Description URL
          </label>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Less reliable
          </span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            id="job-url"
            type="url"
            value={jobUrl}
            onChange={(event) => {
              setJobUrl(event.target.value)
              if (urlError) setUrlError('')
            }}
            placeholder="Paste a job posting URL to try extracting the JD"
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={handleFetchFromUrl}
            disabled={fetchingUrl}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fetchingUrl ? 'Fetching JD...' : 'Fetch from URL'}
          </button>
        </div>

        <p className="text-xs leading-5 text-red-600">
          JD extraction from URLs can be noisy or incomplete on some job sites. For the most reliable resume-to-JD alignment, paste the job description manually whenever possible.
        </p>

        {urlError && (
          <p className="text-sm font-medium text-red-600">{urlError}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || fetchingUrl}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    </form>
  )
}