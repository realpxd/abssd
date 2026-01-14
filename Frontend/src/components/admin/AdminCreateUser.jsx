import { useState, useEffect, useRef } from 'react'
import client from '../../api/client.js'
import api from '../../api/config.js'
import { getImageUrl } from '../../utils/imageUrl.js'
import IDCard from '../IDCard.jsx'

const MEMBERSHIP_PLANS = {
  ordinary: {
    name: 'साधारण सदस्यता / Ordinary Membership',
    amount: 500,
    features: [
      'सभी कार्यक्रमों में भागीदारी / Participation in all events',
      'नियमित अपडेट्स / Regular updates',
      'स्वयंसेवक प्रमाणपत्र / Volunteer certificate',
    ],
  },
  annual: {
    name: 'वार्षिक सदस्यता / Annual Membership',
    amount: 2555,
    features: [
      'सभी कार्यक्रमों में प्राथमिकता / Priority in all events',
      'विशेष अपडेट्स / Special updates',
      'स्वर्ण प्रमाणपत्र / Gold certificate',
      'विशेष बैज / Special badge',
      'मेले के दौरान रहने एवं भोजन की व्यवस्था / Arrangement of accommodation and meals during the fair'
    ],
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
    confirmPassword: '',
  referralCode: '',
    dob: '',
    gender: '',
    fatherName: '',
    motherName: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    aadharNo: '',
    aadharFront: null,
    aadharBack: null,
    aadharConfirmed: false,
    qualification: '',
    occupation: '',
    moreDetails: '',
    photo: null,
  })

  const [states, setStates] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [createdUser, setCreatedUser] = useState(null)
  const printRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const resp = await client(api.endpoints.geo + '/states')
        if (resp && resp.data && Array.isArray(resp.data) && mounted) {
          setStates(resp.data)
        }
      } catch (err) {
        // ignore
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const state = formData.address.state
    if (!state) return
    let mounted = true
    const load = async () => {
      try {
        const resp = await client(api.endpoints.geo + `/cities/${encodeURIComponent(state)}`)
        if (resp && resp.data && Array.isArray(resp.data) && mounted) {
          setCityOptions(resp.data)
          if (resp.data.length && !resp.data.includes(formData.address.city)) {
            setFormData((s) => ({ ...s, address: { ...s.address, city: resp.data[0] } }))
          }
        } else {
          setCityOptions([])
        }
      } catch (err) {
        setCityOptions([])
      }
    }
    load()
    return () => { mounted = false }
  }, [formData.address.state])

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target
    if (type === 'checkbox' && name === 'skipPayment') {
      setSkipPayment(checked)
      return
    }
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData({ ...formData, address: { ...formData.address, [addressField]: value } })
    } else if (name === 'aadharFront' || name === 'aadharBack' || name === 'photo') {
      setFormData({ ...formData, [name]: files && files[0] ? files[0] : null })
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
      const response = await client(api.endpoints.auth + '/check-email', { method: 'POST', body: { email: formData.email } })
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
      const response = await client(api.endpoints.auth + '/check-contact', { method: 'POST', body: { contactNo: formData.contactNo } })
      if (response.exists) setContactError('Contact already registered')
    } catch (e) {}
    setValidating(false)
  }

  const validateStep1 = async () => {
    if (!formData.username || !formData.email || !formData.contactNo || !formData.password) {
      setError('Please fill all required fields')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
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

  const validateStep2 = () => {
    if (!formData.photo) {
      setError('Please upload a photo')
      return false
    }
    const aadhaar = (formData.aadharNo || '').replace(/\s+/g, '')
    const aadhaarRegex = /^[0-9]{12}$/
    if (!aadhaar || !aadhaarRegex.test(aadhaar)) {
      setError('Please enter a valid 12-digit Aadhaar number')
      return false
    }
    setError('')
    return true
  }

  const handleNext = async () => {
    if (step === 1) {
      const ok = await validateStep1()
      if (!ok) return
      setStep(2)
      return
    }
    if (step === 2) {
      const ok = validateStep2()
      if (!ok) return
      setStep(3)
      return
    }
    if (step === 3) {
      const ok = validateAadhaarStep()
      if (!ok) return
      setStep(4)
      return
    }
    setStep(step + 1)
  }

  const handlePrev = () => setStep(step - 1)

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
      const payload = new FormData()
      payload.append('username', formData.username)
      payload.append('email', formData.email)
      payload.append('contactNo', formData.contactNo)
      payload.append('password', formData.password)
      payload.append('dob', formData.dob || '')
      payload.append('gender', formData.gender || '')
      payload.append('fatherName', formData.fatherName || '')
      payload.append('motherName', formData.motherName || '')
      payload.append('aadharNo', formData.aadharNo || '')
      payload.append('qualification', formData.qualification || '')
      payload.append('occupation', formData.occupation || '')
      payload.append('moreDetails', formData.moreDetails || '')
      payload.append('membershipType', selectedPlan)
      payload.append('membershipAmount', MEMBERSHIP_PLANS[selectedPlan].amount)
      payload.append('aadharConfirmed', formData.aadharConfirmed ? 'true' : 'false')
      payload.append('address', JSON.stringify(formData.address || {}))
  if (formData.referralCode) payload.append('referralCode', formData.referralCode)
      if (formData.photo) payload.append('photo', formData.photo)
      if (formData.aadharFront) payload.append('aadharFront', formData.aadharFront)
      if (formData.aadharBack) payload.append('aadharBack', formData.aadharBack)
      if (skipPayment) payload.append('skipPayment', 'true')

  const result = await client(api.endpoints.auth + '/register', { method: 'POST', body: payload })
  // Return full backend result so caller can use created user id
  if (result) return result
  return { success: false, message: 'Registration failed' }
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const validateAadhaarStep = () => {
    if (!formData.aadharFront || !formData.aadharBack) {
      setError('Please upload both front and back images of Aadhaar')
      return false
    }
    if (!formData.aadharConfirmed) {
      setError('Please confirm that you uploaded valid Aadhaar images')
      return false
    }
    setError('')
    return true
  }

  const handlePayment = async () => {
    if (!validateStep1()) return
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
            const registerResult = await handleRegister()
            if (!registerResult.success) {
              setError(registerResult.message || 'Registration failed')
              setPaymentLoading(false)
              return
            }

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
              // Show ID card for printing instead of immediately closing modal
              const created = registerResult.data && registerResult.data.user
              if (created) setCreatedUser(created)
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

  const handleRegisterDirect = async () => {
    setLoading(true)
    setError('')
    try {
      const registerResult = await handleRegister()
      if (!registerResult || !registerResult.success) {
        setError(registerResult?.message || 'Registration failed')
        setLoading(false)
        return
      }

      // If backend returned created user, attempt to set membershipStatus -> active
      const newUser = registerResult.data && registerResult.data.user
      if (newUser && newUser._id) {
        try {
          // Admin endpoints require admin token (client will include token from localStorage)
          await client(api.endpoints.auth + `/users/${newUser._id}/membership`, {
            method: 'PUT',
            body: { membershipStatus: 'active' },
          })
          // Reflect change locally
          newUser.membershipStatus = 'active'
        } catch (e) {
          // Non-fatal: membership update failed, but user was created. Show a warning.
          console.warn('Failed to auto-activate membership for user', e)
        }
      }

      // Show the created user's ID card for printing instead of immediately closing modal
      setCreatedUser(newUser || null)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintCard = () => {
    const node = printRef.current
    if (!node) return

    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow popups for this site to enable printing')
        return
      }

      const headNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      const headHtml = headNodes.map((n) => n.outerHTML).join('\n')
      const cardHtml = node.outerHTML

      printWindow.document.open()
      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Print ID Card - ${createdUser?.username}</title>
            ${headHtml}
            <style>
              body { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f3f4f6; padding:20px; }
              .card-container { box-shadow: none !important; }
            </style>
          </head>
          <body>
            ${cardHtml}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 300)
    } catch (err) {
      console.error('Print error', err)
      alert('Unable to open print window')
    }
  }

  const handleDoneAfterPrint = () => {
    // notify parent to refresh and close modal
    if (onCreated) onCreated()
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
          <div className="text-sm text-gray-500">Step {step} of 4</div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* If user was just created, show ID card and print option */}
        {createdUser && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-[340px]">
                <IDCard ref={printRef} user={createdUser} />
              </div>

              <div className="flex-1 flex flex-col justify-start gap-6">
                <div className="bg-white p-4 rounded shadow-sm">
                  <div className="text-gray-600">Membership Type</div>
                  <div className="font-semibold">{createdUser.membershipType === 'annual' ? 'Annual' : 'Ordinary'}</div>
                </div>

                <div className="bg-white p-4 rounded shadow-sm">
                  <div className="text-gray-600">Member Since</div>
                  <div className="font-semibold">{createdUser.createdAt ? new Date(createdUser.createdAt).toLocaleDateString('en-IN') : 'N/A'}</div>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  <button onClick={handlePrintCard} className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2">प्रिंट करें / Print</button>
                  <button onClick={handleDoneAfterPrint} className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 font-semibold">Done</button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code (optional)</label>
                <input type="text" name="referralCode" value={formData.referralCode} onChange={handleChange} placeholder="5-digit code" maxLength={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={handleNext} disabled={validating || !!emailError || !!contactError} className="bg-orange-500 text-white px-6 py-2 rounded-lg">Next →</button>
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
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address (Street)</label>
              <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select name="address.state" value={formData.address.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Select State</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select name="address.city" value={formData.address.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Select City</option>
                  {cityOptions.length > 0 ? cityOptions.map((c) => <option key={c} value={c}>{c}</option>) : <option value={formData.address.city}>{formData.address.city || 'No cities available'}</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input type="text" name="address.pincode" value={formData.address.pincode} onChange={handleChange} onBlur={async (e) => {
                  const pin = e.target.value?.trim()
                  if (!pin || pin.length < 6) return
                  try {
                    const resp = await client(api.endpoints.geo + `/pincode/${pin}`)
                    if (resp && resp.data) {
                      const { city, state } = resp.data
                      setFormData((s) => ({ ...s, address: { ...s.address, city: city || s.address.city, state: state || s.address.state, pincode: pin } }))
                      setCityOptions(city ? [city] : [])
                    }
                  } catch (err) {
                    // ignore
                  }
                }} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                <input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleChange} maxLength="12" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
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
              <button type="button" onClick={handlePrev} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">← Previous</button>
              <button type="button" onClick={handleNext} className="bg-orange-500 text-white px-6 py-2 rounded-lg">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Front (upload)</label>
                <input type="file" name="aadharFront" accept="image/*" onChange={handleChange} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Back (upload)</label>
                <input type="file" name="aadharBack" accept="image/*" onChange={handleChange} className="w-full" />
              </div>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input type="checkbox" name="aadharConfirmed" checked={!!formData.aadharConfirmed} onChange={(e) => setFormData({ ...formData, aadharConfirmed: e.target.checked })} className="mr-2" />
                I confirm the uploaded Aadhaar images are mine
              </label>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={handlePrev} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">← Previous</button>
              <button type="button" onClick={handleNext} className="bg-orange-500 text-white px-6 py-2 rounded-lg">Next →</button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Payment */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h4 className="font-semibold mb-2">Review</h4>
              <p><strong>Username:</strong> {formData.username}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Contact:</strong> {formData.contactNo}</p>
              <p><strong>City:</strong> {formData.address.city}</p>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="skipPayment" checked={skipPayment} onChange={handleChange} />
                <span className="text-sm">Skip payment (create user without collecting payment)</span>
              </label>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={handlePrev} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">← Previous</button>
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
