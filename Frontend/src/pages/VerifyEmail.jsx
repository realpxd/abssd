import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import client from '../api/client.js'
import api from '../api/config.js'
import AuthHeader from '../components/AuthHeader.jsx'
import SEO from '../components/SEO.jsx'

const VerifyEmail = () => {
  const [search] = useSearchParams()
  const token = search.get('token') || ''
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const doVerify = async () => {
      if (!token) return
      setLoading(true)
      try {
        const res = await client(api.endpoints.auth + '/verify-email', {
          method: 'POST',
          body: { token },
        })
        if (res && res.data && res.data.token) {
          localStorage.setItem('token', res.data.token)
        }
        setSuccess(res.message || 'Email verified successfully')
        setTimeout(() => navigate('/profile'), 1200)
      } catch (err) {
        setError(err.message || 'Failed to verify email')
      }
      setLoading(false)
    }
    doVerify()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <SEO 
        title="Verify Email - Complete Registration"
        description="अपने खाते का पंजीकरण पूरा करने के लिए अपने ईमेल को सत्यापित करें।"
        canonical="/verify-email"
      />
      <AuthHeader showBack={true} />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Email verification</h2>
            {loading && <p>Verifying...</p>}
            {error && <div className="text-red-600 mb-4">{error}</div>}
            {success && <div className="text-green-600 mb-4">{success}</div>}
            {!token && (
              <>
                <p className="mb-4">Verification token missing. Please use the link we emailed you.</p>
                <Link to="/forgot-password" className="text-orange-600">Request a new verification link</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
