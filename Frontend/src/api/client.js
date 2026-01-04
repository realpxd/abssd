import api from './config.js'

const client = async (endpoint, options = {}) => {
  const url = `${api.baseURL}${endpoint}`
  const token = localStorage.getItem('token')
  
  // Check if body is FormData
  const isFormData = options.body instanceof FormData

  // Build config by merging options first, then construct headers so callers can't
  // accidentally overwrite the default Content-Type we set for JSON bodies.
  const config = {
    ...options,
  }

  config.headers = {
    // Don't set Content-Type for FormData, let browser set it with boundary
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  }

  // Only stringify if it's not FormData
  if (config.body && typeof config.body === 'object' && !isFormData) {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return data
  } catch (error) {
    // Enhance error with more context
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check your connection.')
    }
    throw error
  }
}

export default client

