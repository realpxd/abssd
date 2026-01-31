import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client.js'
import api from '../api/config.js'
import AuthHeader from '../components/AuthHeader.jsx'
import SEO from '../components/SEO.jsx'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await client(api.endpoints.auth + '/forgot-password', {
        method: 'POST',
        body: { email },
      })
      setMessage(
        response.resetToken
          ? `Password reset token: ${response.resetToken} (Use this in development)`
          : 'Password reset link sent to your email'
      )
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Error sending reset email')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <SEO 
        title="Forgot Password - Account Recovery"
        description="अपना पासवर्ड रीसेट करें। अपना ईमेल पता दर्ज करें और पासवर्ड रीसेट लिंक प्राप्त करें।"
        canonical="/forgot-password"
      />
      <AuthHeader showBack={true} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section with Gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-10 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">पासवर्ड रीसेट</h2>
              <p className="text-orange-100 text-sm">Reset your password</p>
            </div>

            {/* Form Section */}
            <div className="px-8 py-8">
              {!submitted ? (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 text-center">
                      अपना ईमेल पता दर्ज करें और हम आपको पासवर्ड रीसेट लिंक भेजेंगे।
                      <br />
                      Enter your email address and we'll send you a password reset link.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        ईमेल पता / Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                            />
                          </svg>
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          भेज रहे हैं... / Sending...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          रीसेट लिंक भेजें / Send Reset Link
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  {/* Success Message */}
                  <div className="mb-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                      <svg
                        className="h-8 w-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      लिंक भेज दिया गया! / Link Sent!
                    </h3>
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6">
                      <p className="text-sm">{message}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                      कृपया अपने ईमेल इनबॉक्स की जांच करें। लिंक 10 मिनट के लिए वैध होगा।
                      <br />
                      Please check your email inbox. The link will be valid for 10 minutes.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                    >
                      वापस लॉगिन पर जाएं / Back to Login
                    </Link>
                    <button
                      onClick={() => {
                        setSubmitted(false)
                        setEmail('')
                        setMessage('')
                      }}
                      className="block w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                    >
                      नया अनुरोध / New Request
                    </button>
                  </div>
                </div>
              )}

              {/* Back to Login Link */}
              {!submitted && (
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    वापस लॉगिन पर जाएं / Back to Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              सुरक्षित पासवर्ड रीसेट / Secure password reset by ABSSD Trust
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
