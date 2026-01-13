import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import client from '../api/client.js'
import api from '../api/config.js'
import AuthHeader from '../components/AuthHeader.jsx'

const MEMBERSHIP_PLANS = {
  annual: {
    name: 'वार्षिक सदस्यता / Annual Membership',
    amount: 500,
    features: [
      '1 वर्ष की सदस्यता / 1 Year Membership',
      'सभी कार्यक्रमों में भागीदारी / Participation in all events',
      'नियमित अपडेट्स / Regular updates',
      'स्वयंसेवक प्रमाणपत्र / Volunteer certificate',
    ],
  },
  lifetime: {
    name: 'जीवनकाल सदस्यता / Lifetime Membership',
    amount: 5000,
    features: [
      'जीवनकाल सदस्यता / Lifetime Membership',
      'सभी कार्यक्रमों में प्राथमिकता / Priority in all events',
      'विशेष अपडेट्स / Special updates',
      'स्वर्ण प्रमाणपत्र / Gold certificate',
      'विशेष बैज / Special badge',
    ],
  },
}

const Register = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('annual')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [contactError, setContactError] = useState('')

  const [formData, setFormData] = useState({
    // Basic Info
    username: '',
    email: '',
    contactNo: '',
    password: '',
    confirmPassword: '',
    // Personal Details
    dob: '',
    gender: '',
    fatherName: '',
    motherName: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    aadharNo: '',
    qualification: '',
    occupation: '',
    moreDetails: '',
    photo: null,
  })

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Show loading screen if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to profile...</p>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      })
    } else if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
    setError('')
    // Clear field-specific errors when user types
    if (name === 'email') {
      setEmailError('')
    }
    if (name === 'contactNo') {
      setContactError('')
    }
  }

  // Validate email on blur
  const handleEmailBlur = async () => {
    if (!formData.email) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setEmailError('कृपया वैध ईमेल दर्ज करें / Please enter a valid email')
      return
    }

    setValidating(true)
    setEmailError('')
    try {
      const response = await client(api.endpoints.auth + '/check-email', {
        method: 'POST',
        body: { email: formData.email },
      })
      if (response.exists) {
        setEmailError('यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें / This email is already registered. Please login.')
      }
    } catch (error) {
      // Silently fail - don't show error for validation check
    }
    setValidating(false)
  }

  // Validate contact number on blur
  const handleContactBlur = async () => {
    if (!formData.contactNo) return

    // Basic phone number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.contactNo.replace(/\D/g, ''))) {
      setContactError('कृपया वैध संपर्क नंबर दर्ज करें (10 अंक) / Please enter a valid contact number (10 digits)')
      return
    }

    setValidating(true)
    setContactError('')
    try {
      const response = await client(api.endpoints.auth + '/check-contact', {
        method: 'POST',
        body: { contactNo: formData.contactNo },
      })
      if (response.exists) {
        setContactError('यह संपर्क नंबर पहले से पंजीकृत है / This contact number is already registered')
      }
    } catch (error) {
      // Silently fail - don't show error for validation check
    }
    setValidating(false)
  }

  const validateStep1 = async () => {
    if (!formData.username || !formData.email || !formData.contactNo || !formData.password) {
      setError('कृपया सभी आवश्यक फ़ील्ड भरें / Please fill all required fields')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('पासवर्ड मेल नहीं खा रहे हैं / Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षर का होना चाहिए / Password must be at least 6 characters')
      return false
    }

    // Check email and contact number if not already checked
    if (!emailError && formData.email) {
      setValidating(true)
      try {
        const emailResponse = await client(api.endpoints.auth + '/check-email', {
          method: 'POST',
          body: { email: formData.email },
        })
        if (emailResponse.exists) {
          setEmailError('यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें / This email is already registered. Please login.')
          setValidating(false)
          return false
        }
      } catch (error) {
        setError('ईमेल जांचने में त्रुटि / Error checking email')
        setValidating(false)
        return false
      }
    }

    if (!contactError && formData.contactNo) {
      try {
        const contactResponse = await client(api.endpoints.auth + '/check-contact', {
          method: 'POST',
          body: { contactNo: formData.contactNo },
        })
        if (contactResponse.exists) {
          setContactError('यह संपर्क नंबर पहले से पंजीकृत है / This contact number is already registered')
          setValidating(false)
          return false
        }
      } catch (error) {
        setError('संपर्क नंबर जांचने में त्रुटि / Error checking contact number')
        setValidating(false)
        return false
      }
    }

    // If there are field-specific errors, don't proceed
    if (emailError || contactError) {
      setValidating(false)
      return false
    }

    setValidating(false)
    return true
  }

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await validateStep1()
      if (!isValid) {
        return
      }
    }
    setStep(step + 1)
  }

  const handlePrev = () => {
    setStep(step - 1)
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(window.Razorpay)
      script.onerror = () => resolve(null)
      document.body.appendChild(script)
    })
  }

  const handleRegisterDirect = async () => {
    setLoading(true)
    setError('')

    try {
      const registerResult = await handleRegister()

      if (!registerResult.success) {
        setError(registerResult.message || 'Registration failed')
        setLoading(false)
        return
      }

      // Verify payment with user email
    } catch (err) {
      setError(err.message || 'Registration failed')
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!validateStep1()) return

    setPaymentLoading(true)
    setError('')

    try {
      // Create order
      const orderResponse = await client(api.endpoints.payment + '/create-order', {
        method: 'POST',
        body: {
          amount: MEMBERSHIP_PLANS[selectedPlan].amount,
          membershipType: selectedPlan,
        },
      })

      const Razorpay = await loadRazorpay()
      if (!Razorpay) {
        throw new Error('Razorpay SDK failed to load')
      }

      const options = {
        key: orderResponse.data.key,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'ABSSD Trust',
        description: `Membership: ${MEMBERSHIP_PLANS[selectedPlan].name}`,
        order_id: orderResponse.data.orderId,
        handler: async (response) => {
          try {
            // Register user first
            const registerResult = await handleRegister()
            
            if (!registerResult.success) {
              setError(registerResult.message || 'Registration failed')
              setPaymentLoading(false)
              return
            }

            // Verify payment with user email
            const verifyResponse = await client(api.endpoints.payment + '/verify', {
              method: 'POST',
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: formData.email,
                membershipType: selectedPlan,
                membershipAmount: MEMBERSHIP_PLANS[selectedPlan].amount,
              },
            })

            if (verifyResponse.success) {
              // Payment verified and membership activated
              navigate('/profile')
            } else {
              setError(verifyResponse.message || 'Payment verification failed')
              setPaymentLoading(false)
            }
          } catch (err) {
            setError(err.message || 'Payment verification failed')
            setPaymentLoading(false)
          }
        },
        prefill: {
          name: formData.username,
          email: formData.email,
          contact: formData.contactNo,
        },
        theme: {
          color: '#F97316',
        },
      }

      const razorpay = new Razorpay(options)
      razorpay.open()
      razorpay.on('payment.failed', (response) => {
        setError('Payment failed. Please try again.')
        setPaymentLoading(false)
      })
    } catch (err) {
      setError(err.message || 'Error initiating payment')
      setPaymentLoading(false)
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    setError('')

    try {
      const submitData = {
        ...formData,
        membershipType: selectedPlan,
        membershipAmount: MEMBERSHIP_PLANS[selectedPlan].amount,
      }

      delete submitData.confirmPassword
      delete submitData.photo

      // Handle photo upload separately if needed
      if (formData.photo) {
        const photoFormData = new FormData()
        photoFormData.append('photo', formData.photo)
        // Photo will be uploaded after registration in profile update
      }

      const result = await register(submitData)

      if (result.success) {
        return { success: true }
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed',
        }
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Registration failed',
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <AuthHeader showBack={true} />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        {/* Membership Info Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">
            सदस्यता योजना / Membership Plans
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(MEMBERSHIP_PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 border-2 ${
                  selectedPlan === key ? 'border-white' : 'border-transparent'
                } cursor-pointer transition-all`}
                onClick={() => setSelectedPlan(key)}
              >
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4">₹{plan.amount}</div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              सदस्यता के लिए पंजीकरण करें / Register for Membership
            </h2>
            <div className="text-sm text-gray-500">
              Step {step} of 3
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">मूल जानकारी / Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    उपयोगकर्ता नाम * / Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ईमेल * / Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      emailError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validating && formData.email && (
                    <p className="text-xs text-gray-500 mt-1">Checking...</p>
                  )}
                  {emailError && (
                    <p className="text-xs text-red-600 mt-1">{emailError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    संपर्क नंबर * / Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleChange}
                    onBlur={handleContactBlur}
                    required
                    maxLength="10"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      contactError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validating && formData.contactNo && (
                    <p className="text-xs text-gray-500 mt-1">Checking...</p>
                  )}
                  {contactError && (
                    <p className="text-xs text-red-600 mt-1">{contactError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    पासवर्ड * / Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    पासवर्ड की पुष्टि करें * / Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={validating || !!emailError || !!contactError}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validating ? 'जांच रहे हैं...' : 'अगला / Next →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">व्यक्तिगत विवरण / Personal Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    जन्म तिथि / Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    लिंग / Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">चुनें / Select</option>
                    <option value="male">पुरुष / Male</option>
                    <option value="female">महिला / Female</option>
                    <option value="other">अन्य / Other</option>
                    <option value="prefer-not-to-say">बताना पसंद नहीं / Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    पिता का नाम / Father's Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    माता का नाम / Mother's Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    पता / Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="सड़क / Street"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <div className="grid md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="शहर / City"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="राज्य / State"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      placeholder="पिन कोड / Pincode"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    आधार नंबर / Aadhar Number
                  </label>
                  <input
                    type="text"
                    name="aadharNo"
                    value={formData.aadharNo}
                    onChange={handleChange}
                    maxLength="12"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    योग्यता / Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    व्यवसाय / Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    फोटो / Photo
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    अधिक विवरण / More Details
                  </label>
                  <textarea
                    name="moreDetails"
                    value={formData.moreDetails}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  ← पिछला / Previous
                </button>
                <button
                  type="button"
                  onClick={handleRegisterDirect}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  पंजीकरण करें / Register
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">समीक्षा और भुगतान / Review & Payment</h3>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="font-semibold mb-4">चयनित योजना / Selected Plan</h4>
                <div className="mb-4">
                  <div className="text-lg font-bold">{MEMBERSHIP_PLANS[selectedPlan].name}</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{MEMBERSHIP_PLANS[selectedPlan].amount}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>कृपया अपनी जानकारी की समीक्षा करें और भुगतान करने के लिए आगे बढ़ें।</p>
                  <p>Please review your information and proceed to payment.</p>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  ← पिछला / Previous
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paymentLoading || loading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  {paymentLoading ? 'भुगतान हो रहा है...' : 'भुगतान करें / Pay Now'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            पहले से ही एक खाता है?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-500 font-medium">
              लॉगिन करें / Login
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Register

