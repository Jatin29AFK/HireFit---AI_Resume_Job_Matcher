const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

async function postForm(endpoint, formData) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let errorMessage = 'Something went wrong while processing your request.'
    try {
      const errorData = await response.json()
      if (errorData.detail) errorMessage = errorData.detail
    } catch {
      // ignore parse failure
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function analyzeResume(formData) {
  return postForm('/matcher/upload', formData)
}

export async function tailorResume(formData) {
  return postForm('/matcher/tailor-resume', formData)
}

export async function compareMultipleJDs(formData) {
  return postForm('/matcher/compare-jds', formData)
}