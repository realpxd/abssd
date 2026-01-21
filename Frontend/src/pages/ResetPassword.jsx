import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import client from '../api/client.js'
import api from '../api/config.js'
import AuthHeader from '../components/AuthHeader.jsx'

const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const tokenFromQuery = params.get('token') || ''

  const [token, setToken] = useState(tokenFromQuery)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (tokenFromQuery) setToken(tokenFromQuery)
  }, [tokenFromQuery])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) return setError('Reset token is missing. Please use the link from your email.')
    if (!password || password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')

    setLoading(true)
    try {
      const res = await client(api.endpoints.auth + '/reset-password', {
        method: 'POST',
        body: { token, password },
      })

      // Backend returns token and user on success. Store token and navigate to profile.
      if (res && res.data && res.data.token) {
        localStorage.setItem('token', res.data.token)
        setSuccess('Password reset successful. Redirecting...')
        setTimeout(() => navigate('/profile'), 1200)
        return
      }

      setSuccess(res.message || 'Password reset successful. You may now log in.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <AuthHeader showBack={true} />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-10 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zM21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">पासवर्ड रीसेट करें</h2>
              <p className="text-orange-100 text-sm">Set a new password for your account</p>
            </div>

            <div className="px-8 py-8">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-7.414 7.414a1 1 0 01-1.414 0L3.293 9.121a1 1 0 011.414-1.414L8 10.999l6.293-6.293a1 1 0 011.414 0z" />
                    </svg>
                    <span className="text-sm font-medium">{success}</span>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">नया पासवर्ड / New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">पासवर्ड की पुष्टि / Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="block w-full pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="Re-enter password"
                  />
                </div>

                {/* Hidden token field for users who paste the token manually */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reset Token (from email)</label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="block w-full pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none transition-all"
                    placeholder="Token (auto-filled from link)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      सेट कर रहे हैं... / Setting...
                    </>
                  ) : (
                    'पासवर्ड सेट करें / Set Password'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors">कृपया एक नया अनुरोध भेजें / Request a new link</Link>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Secure password reset / ABSSD Trust</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
