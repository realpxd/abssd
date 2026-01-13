import { useState, useEffect } from 'react'
import client from '../../api/client.js'
import api from '../../api/config.js'

const MEMBERSHIP_PLANS = {
  annual: {
    name: 'वार्षिक सदस्यता / Annual Membership',
    amount: 500,
  },
  lifetime: {
    name: 'जीवनकाल सदस्यता / Lifetime Membership',
    amount: 5000,
  },
}

const AdminCreateUser = ({ onCreated, onCancel }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('annual')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [contactError, setContactError] = useState('')
  const [skipPayment, setSkipPayment] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNo: '',
    password: '',
    dob: '',
    gender: '',
    fatherName: '',
    motherName: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    aadharNo: '',
    qualification: '',
    occupation: '',
    moreDetails: '',
    photo: null,
  })

  useEffect(() => {
    // reset when opened
    setStep(1)
    setError('')
    setSkipPayment(false)
  }, [])

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target
    if (type === 'checkbox' && name === 'skipPayment') {
      setSkipPayment(checked)
      return
    }
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData({ ...formData, address: { ...formData.address, [addressField]: value } })
    } else if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
    setError('')
    if (name === 'email') setEmailError('')
    if (name === 'contactNo') setContactError('')
  }

  const handleEmailBlur = async () => {
    if (!formData.email) return
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email')
      return
    }
    setValidating(true)
    setEmailError('')
    try {
      const response = await client(api.endpoints.auth + '/check-email', {
        method: 'POST',
        body: { email: formData.email },
      })
      if (response.exists) setEmailError('Email already registered')
    } catch (e) {}
    setValidating(false)
  }

  const handleContactBlur = async () => {
    if (!formData.contactNo) return
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.contactNo.replace(/\D/g, ''))) {
      setContactError('Please enter a valid 10-digit number')
      return
    }
    setValidating(true)
    setContactError('')
    try {
      const response = await client(api.endpoints.auth + '/check-contact', {
        method: 'POST',
        body: { contactNo: formData.contactNo },
      })
      if (response.exists) setContactError('Contact already registered')
    } catch (e) {}
    setValidating(false)
  }

  const validateStep1 = async () => {
    if (!formData.username || !formData.email || !formData.contactNo || !formData.password) {
      setError('Please fill all required fields')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }

    if (!emailError && formData.email) {
      setValidating(true)
      try {
        const emailResponse = await client(api.endpoints.auth + '/check-email', { method: 'POST', body: { email: formData.email } })
        if (emailResponse.exists) { setEmailError('Email already registered'); setValidating(false); return false }
      } catch (e) { setError('Error checking email'); setValidating(false); return false }
    }

    if (!contactError && formData.contactNo) {
      try {
        const contactResponse = await client(api.endpoints.auth + '/check-contact', { method: 'POST', body: { contactNo: formData.contactNo } })
        if (contactResponse.exists) { setContactError('Contact already registered'); setValidating(false); return false }
      } catch (e) { setError('Error checking contact'); setValidating(false); return false }
    }

    if (emailError || contactError) { setValidating(false); return false }
    setValidating(false)
    return true
  }

  const next = async () => {
    if (step === 1) {
      const ok = await validateStep1()
      if (!ok) return
    }
    setStep((s) => Math.min(3, s + 1))
  }

  const prev = () => setStep((s) => Math.max(1, s - 1))

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(window.Razorpay)
      script.onerror = () => resolve(null)
      document.body.appendChild(script)
    })
  }

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      const submitData = { ...formData, membershipType: selectedPlan, membershipAmount: MEMBERSHIP_PLANS[selectedPlan].amount }
      delete submitData.photo
      // If skipPayment is set, include flag so backend can activate without payment
      if (skipPayment) submitData.skipPayment = true
      const response = await client(api.endpoints.auth + '/register', { method: 'POST', body: submitData })
      setLoading(false)
      return { success: true, data: response }
    } catch (err) {
      setLoading(false)
      return { success: false, message: err.message || 'Registration failed' }
    }
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
      alert('User created successfully')
      if (onCreated) onCreated()
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    const ok = await validateStep1()
    if (!ok) return
    setPaymentLoading(true)
    setError('')
    try {
      const orderResponse = await client(api.endpoints.payment + '/create-order', {
        method: 'POST',
        body: { amount: MEMBERSHIP_PLANS[selectedPlan].amount, membershipType: selectedPlan },
      })
      const Razorpay = await loadRazorpay()
      if (!Razorpay) throw new Error('Razorpay SDK failed to load')

      const options = {
        key: orderResponse.data.key,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'ABSSD Trust',
        description: `Membership: ${MEMBERSHIP_PLANS[selectedPlan].name}`,
        order_id: orderResponse.data.orderId,
        handler: async (response) => {
          try {
            // Register user first (admin registering; backend should not auto-login admin)
            const registerResult = await handleRegister()
            if (!registerResult.success) {
              setError(registerResult.message || 'Registration failed')
              setPaymentLoading(false)
              return
            }

            // Verify payment
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
              alert('User created and payment verified')
              if (onCreated) onCreated()
            } else {
              setError(verifyResponse.message || 'Payment verification failed')
            }
          } catch (err) {
            setError(err.message || 'Payment verification failed')
          } finally {
            setPaymentLoading(false)
          }
        },
        prefill: { name: formData.username, email: formData.email, contact: formData.contactNo },
        theme: { color: '#F97316' },
      }

      const razorpay = new Razorpay(options)
      razorpay.open()
      razorpay.on('payment.failed', () => {
        setError('Payment failed. Please try again.')
        setPaymentLoading(false)
      })
    } catch (err) {
      setError(err.message || 'Error initiating payment')
      setPaymentLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 mb-4 text-white">
        <h2 className="text-xl font-bold mb-2">Membership Plans</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(MEMBERSHIP_PLANS).map(([key, plan]) => (
            <div key={key} className={`p-4 rounded border ${selectedPlan === key ? 'border-white' : 'border-transparent'}`} onClick={() => setSelectedPlan(key)}>
              <h3 className="font-bold">{plan.name}</h3>
              <div className="text-2xl">₹{plan.amount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Create User</h2>
          <div className="text-sm text-gray-500">Step {step} of 3</div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                {validating && formData.email && <p className="text-xs text-gray-500 mt-1">Checking...</p>}
                {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input type="tel" name="contactNo" value={formData.contactNo} onChange={handleChange} onBlur={handleContactBlur} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                {validating && formData.contactNo && <p className="text-xs text-gray-500 mt-1">Checking...</p>}
                {contactError && <p className="text-xs text-red-600 mt-1">{contactError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={next} disabled={validating || !!emailError || !!contactError} className="bg-orange-500 text-white px-6 py-2 rounded-lg">Next →</button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address (City)</label>
              <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                <input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">More Details</label>
              <textarea name="moreDetails" value={formData.moreDetails} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
              <input type="file" name="photo" accept="image/*" onChange={handleChange} className="w-full" />
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={prev} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">← Previous</button>
              <button type="button" onClick={next} className="bg-orange-500 text-white px-6 py-2 rounded-lg">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h4 className="font-semibold mb-2">Review</h4>
              <p><strong>Username:</strong> {formData.username}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Contact:</strong> {formData.contactNo}</p>
              <p><strong>City:</strong> {formData.address.city}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
              <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="annual">Annual</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="skipPayment" checked={skipPayment} onChange={handleChange} />
                <span className="text-sm">Skip payment (activate membership without collecting payment)</span>
              </label>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={prev} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">← Previous</button>
              <div>
                {!skipPayment && <button type="button" onClick={handlePayment} disabled={paymentLoading || loading} className="bg-green-600 text-white px-6 py-2 rounded-lg mr-2">{paymentLoading ? 'Processing...' : 'Pay Now'}</button>}
                <button type="button" onClick={handleRegisterDirect} disabled={loading} className="bg-orange-500 text-white px-6 py-2 rounded-lg">{loading ? 'Creating...' : 'Create User'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminCreateUser
