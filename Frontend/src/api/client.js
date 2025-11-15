import api from './config.js'

const client = async (endpoint, options = {}) => {
  const url = `${api.baseURL}${endpoint}`
  const token = localStorage.getItem('token')
  
  // Check if body is FormData
  const isFormData = options.body instanceof FormData

  const config = {
    headers: {
      // Don't set Content-Type for FormData, let browser set it with boundary
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  // Only stringify if it's not FormData
  if (config.body && typeof config.body === 'object' && !isFormData) {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred')
    }
    
    return data
  } catch (error) {
    throw error
  }
}

export default client

