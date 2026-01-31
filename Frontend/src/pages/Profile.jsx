import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import client from '../api/client.js'
import api from '../api/config.js'
import Logo from '../components/Logo.jsx'
import IDCard from '../components/IDCard.jsx'
import SEO from '../components/SEO.jsx'
import { getImageUrl } from '../utils/imageUrl.js'

const Profile = () => {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const printRef = useRef(null)
  const [activeTab, setActiveTab] = useState('idcard')
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({})
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [verifyEmailLoading, setVerifyEmailLoading] = useState(false)
  const [verifyEmailMessage, setVerifyEmailMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        contactNo: user.contactNo || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        fatherName: user.fatherName || '',
        motherName: user.motherName || '',
        address: user.address || { street: '', city: '', state: '', pincode: '', country: 'India' },
        aadharNo: user.aadharNo || '',
        qualification: user.qualification || '',
        occupation: user.occupation || '',
        moreDetails: user.moreDetails || '',
      })
    }
  }, [user])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handlePrintCard = () => {
    const node = printRef.current
    if (!node) return

    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow popups for this site to enable printing')
        return
      }

      // Collect current page styles (link and style tags) so the printed card looks identical
      const headNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      const headHtml = headNodes.map((n) => n.outerHTML).join('\n')

      // Clone the card DOM node (use outerHTML so classes and images are preserved)
      const cardHtml = node.outerHTML

      printWindow.document.open()
      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Print ID Card - ${user.username}</title>
            ${headHtml}
            <style>
              body { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f3f4f6; padding:20px; }
              /* Ensure the card prints in its natural size */
              .card-container { box-shadow: none !important; }
            </style>
          </head>
          <body>
            ${cardHtml}
          </body>
        </html>
      `)
      printWindow.document.close()
      // Focus then print
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

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'photo' && files && files[0]) {
      const file = files[0]
      setPhotoFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // If photo is selected, use FormData, otherwise use JSON
      let response
      if (photoFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('photo', photoFile)
        
        // Append other form fields
        Object.keys(formData).forEach((key) => {
          if (key === 'address') {
            Object.keys(formData.address).forEach((addrKey) => {
              formDataToSend.append(`address.${addrKey}`, formData.address[addrKey])
            })
          } else {
            formDataToSend.append(key, formData[key])
          }
        })

        response = await client(api.endpoints.auth + '/profile', {
          method: 'PUT',
          body: formDataToSend,
        })
      } else {
        response = await client(api.endpoints.auth + '/profile', {
          method: 'PUT',
          body: formData,
        })
      }
      
      updateUser(response.data)
      setEditMode(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      alert('Profile updated successfully')
    } catch (error) {
      alert(error.message || 'Error updating profile')
    }
    setLoading(false)
  }

  const handlePhotoUpload = async (e) => {
    e.preventDefault()
    if (!photoFile) {
      alert('Please select a photo first')
      return
    }

    setUploadingPhoto(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('photo', photoFile)

      const response = await client(api.endpoints.auth + '/profile', {
        method: 'PUT',
        body: formDataToSend,
      })
      
      updateUser(response.data)
      setPhotoFile(null)
      setPhotoPreview(null)
      alert('Photo updated successfully')
    } catch (error) {
      alert(error.message || 'Error uploading photo')
    }
    setUploadingPhoto(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const photoUrl = user.photo ? getImageUrl(user.photo) : null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO 
        title="My Profile - Member Dashboard"
        description="अपनी सदस्य प्रोफाइल देखें और प्रबंधित करें। अपना ID कार्ड डाउनलोड करें और दान का इतिहास देखें।"
        canonical="/profile"
        robots="noindex, follow"
      />
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            प्रोफ़ाइल / Profile
          </h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b">
              {[
                { id: 'idcard', label: 'ID Card', hi: 'आईडी कार्ड' },
                { id: 'personal', label: 'Personal Settings', hi: 'व्यक्तिगत सेटिंग्स' },
                { id: 'privacy', label: 'Privacy & Security', hi: 'गोपनीयता और सुरक्षा' },
                // { id: 'notifications', label: 'Notifications', hi: 'सूचनाएं' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setEditMode(false)
                  }}
                  className={`px-6 py-4 font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-orange-500 text-orange-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.hi} / {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ID Card View */}
          {activeTab === 'idcard' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              {user.membershipStatus && user.membershipStatus === 'pending' && (
                <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
                  <p className="mb-4">आपका सदस्यता आवेदन प्रक्रिया में है। कृपया कुछ समय प्रतीक्षा करें या समर्थन से संपर्क करें।</p>
                  <button
                    onClick={() => {
                      const message = `Hello, I would like to verify my membership. \nMy username is _${user.username}_. \nMy user ID is _${user._id}_.\nThank you.\n\n_redirected from abssd.in_`;
                      window.open(`https://wa.me/8860442044?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="inline-flex items-center bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
                  >
                    Verify Membership Status
                  </button>
                </div>
              )}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: ID card (shared component) */}
                  <div className="md:w-[380px]">
                    <IDCard ref={printRef} user={user} photoPreview={photoPreview} watermarkText="sample sample sample sample sample sample sample sample sample sample sample" />
                  </div>

                  {/* Right: membership panel */}
                  <div className="flex-1 flex flex-col justify-start gap-6">
                    <div className="bg-white p-4 rounded shadow-sm">
                      <div className="text-gray-600">Membership Type</div>
                      <div className="font-semibold">
                        {user.membershipType === 'annual' ? 'Annual' : 'Ordinary'}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded shadow-sm">
                      <div className="text-gray-600">Member Since</div>
                      <div className="font-semibold">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </div>
                    </div>

                    {user.isTeamLeader && (
                      <div className="bg-white p-4 rounded shadow-sm">
                        <div className="text-gray-600">Referral Code</div>
                        <div className="font-semibold">{user.referralCode || 'N/A'}</div>
                      </div>
                    )}

                    {user.referredBy && (
                      <div className="bg-white p-4 rounded shadow-sm">
                        <div className="text-gray-600">Team Leader</div>
                        <div className="font-semibold">{user.referredBy.username} {user.referredBy.referralCode ? `(${user.referredBy.referralCode})` : ''}</div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 mt-auto">
                      {/* <button
                        onClick={handlePrintCard}
                        className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        प्रिंट करें / Print
                      </button> */}

                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 font-semibold"
                      >
                        लॉगआउट करें / Logout
                      </button>
                    </div>
                  </div>
                </div>


                {/* Photo Upload Section */}
                {photoFile && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">New photo selected. Click below to upload.</p>
                    <button
                      onClick={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingPhoto ? 'Uploading...' : 'Upload Photo / फोटो अपलोड करें'}
                    </button>
                    <button
                      onClick={() => {
                        setPhotoFile(null)
                        setPhotoPreview(null)
                      }}
                      className="w-full mt-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel / रद्द करें
                    </button>
                  </div>
                )}
              </div>
          )}

          {/* Personal Settings */}
          {activeTab === 'personal' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">व्यक्तिगत सेटिंग्स / Personal Settings</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    संपादित करें / Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Photo Upload Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      प्रोफ़ाइल फोटो / Profile Photo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {photoPreview || photoUrl ? (
                          <img
                            src={photoPreview || photoUrl}
                            alt="Profile Preview"
                            className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
                            loading='lazy'
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-400">
                              {user.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 inline-block">
                          {photoFile ? 'Change Photo' : 'Choose Photo'}
                          <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                          />
                        </label>
                        {photoFile && (
                          <p className="text-sm text-gray-600 mt-2">{photoFile.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        उपयोगकर्ता नाम / Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        संपर्क नंबर / Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNo"
                        value={formData.contactNo}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        जन्म तिथि / Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        पता / Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address?.street || ''}
                        onChange={handleChange}
                        placeholder="Street"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-orange-500"
                      />
                      <div className="grid md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address?.city || ''}
                          onChange={handleChange}
                          placeholder="City"
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address?.state || ''}
                          onChange={handleChange}
                          placeholder="State"
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="text"
                          name="address.pincode"
                          value={formData.address?.pincode || ''}
                          onChange={handleChange}
                          placeholder="Pincode"
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {loading ? 'सेव हो रहा है...' : 'सेव करें / Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false)
                        setPhotoFile(null)
                        setPhotoPreview(null)
                        setFormData({
                          username: user.username || '',
                          contactNo: user.contactNo || '',
                          dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                          gender: user.gender || '',
                          fatherName: user.fatherName || '',
                          motherName: user.motherName || '',
                          address: user.address || { street: '', city: '', state: '', pincode: '', country: 'India' },
                          aadharNo: user.aadharNo || '',
                          qualification: user.qualification || '',
                          occupation: user.occupation || '',
                          moreDetails: user.moreDetails || '',
                        })
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      रद्द करें / Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-600">Username</div>
                      <div className="font-semibold">{user.username}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Email</div>
                      <div className="font-semibold">{user.email}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Contact Number</div>
                      <div className="font-semibold">{user.contactNo}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Date of Birth</div>
                      <div className="font-semibold">
                        {user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Gender</div>
                      <div className="font-semibold">{user.gender || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Father's Name</div>
                      <div className="font-semibold">{user.fatherName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Mother's Name</div>
                      <div className="font-semibold">{user.motherName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Aadhar Number</div>
                      <div className="font-semibold">{user.aadharNo || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Qualification</div>
                      <div className="font-semibold">{user.qualification || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Occupation</div>
                      <div className="font-semibold">{user.occupation || 'N/A'}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-gray-600">Address</div>
                      <div className="font-semibold">
                        {user.address
                          ? `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''}, ${user.address.pincode || ''}`
                          : 'N/A'}
                      </div>
                    </div>
                    {user.moreDetails && (
                      <div className="md:col-span-2">
                        <div className="text-gray-600">More Details</div>
                        <div className="font-semibold">{user.moreDetails}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Security */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">गोपनीयता और सुरक्षा / Privacy & Security</h2>
              <div className="space-y-4">
                {/* <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Password</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Change your password to keep your account secure.
                  </p>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                    Change Password
                  </button>
                </div> */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Email Verification</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Status: {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </p>
                  {!user.isEmailVerified && (
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      onClick={async () => {
                        setVerifyEmailLoading(true)
                        setVerifyEmailMessage('')
                        try {
                          await client(api.endpoints.auth + '/send-email-verification', {
                            method: 'POST',
                          })
                          setVerifyEmailMessage('Verification email sent. Please check your inbox.')
                        } catch (err) {
                          setVerifyEmailMessage(err.message || 'Failed to send verification email')
                        }
                        setVerifyEmailLoading(false)
                      }}
                    >
                      {verifyEmailLoading ? 'Sending...' : 'Verify Email'}
                    </button>
                  )}
                  {verifyEmailMessage && <div className="text-sm mt-2 text-gray-600">{verifyEmailMessage}</div>}
                </div>
                {user.membershipStatus === 'pending' && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-2">Membership Verification</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Status: Not Verified
                    </p>
                    {!user.isMembershipVerified && (
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" 
                        onClick={() => {
                          const message = `Hello, I would like to verify my membership. \nMy username is _${user.username}_. \nMy user ID is _${user._id}_.\nThank you.\n\n_redirected from abssd.in_`;
                          window.open(`https://wa.me/8860442044?text=${encodeURIComponent(message)}`, '_blank');
                      }}>
                        Contact Support to Verify Membership
                      </button>
                    )}
                  </div>
                )}
                {/* <div>
                  <h3 className="font-semibold mb-2">Account Deletion</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                    Delete Account
                  </button>
                </div> */}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">सूचनाएं और ईमेल / Notifications & Emails</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-semibold">Email Notifications</h3>
                    <p className="text-gray-600 text-sm">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-semibold">Event Notifications</h3>
                    <p className="text-gray-600 text-sm">Get notified about upcoming events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Newsletter</h3>
                    <p className="text-gray-600 text-sm">Subscribe to our newsletter</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Logout moved to right panel */}
        </div>
      </div>
    </div>
  )
}

export default Profile

