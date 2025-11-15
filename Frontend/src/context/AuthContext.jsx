import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client.js'
import api from '../api/config.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Set auth token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await client(api.endpoints.auth + '/me')
          setUser(response.data)
        } catch (error) {
          // Token is invalid or expired, clear it
          setToken(null)
          setUser(null)
          localStorage.removeItem('token')
        }
      } else {
        setLoading(false)
      }
      setLoading(false)
    }
    checkAuth()
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await client(api.endpoints.auth + '/login', {
        method: 'POST',
        body: { email, password },
      })
      setToken(response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
      }
    }
  }

  const adminLogin = async (email, password) => {
    try {
      const response = await client(api.endpoints.auth + '/admin/login', {
        method: 'POST',
        body: { email, password },
      })
      setToken(response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Admin login failed',
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await client(api.endpoints.auth + '/register', {
        method: 'POST',
        body: userData,
      })
      setToken(response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const updateUser = (userData) => {
    setUser({ ...user, ...userData })
  }

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

