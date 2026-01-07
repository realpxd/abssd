const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

export const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: '/auth',
    contact: '/contact',
    gallery: '/gallery',
    events: '/events',
    members: '/members',
    payment: '/payment',
    users: '/auth/users',
  },
}

export default api

