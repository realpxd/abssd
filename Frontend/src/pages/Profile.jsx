import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import client from '../api/client.js'
import api from '../api/config.js'
import Logo from '../components/Logo.jsx'
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
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ID Card - ${user.username}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f3f4f6;
              padding: 20px;
            }
            .card-container {
              width: 100%;
              max-width: 500px;
              background: linear-gradient(to bottom right, #f97316, #ea580c);
              border-radius: 8px;
              padding: 24px;
              color: white;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            .logo-section {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .logo-section h2 {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .logo-section p {
              font-size: 12px;
              opacity: 0.9;
              margin: 0;
            }
            .photo {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              border: 2px solid white;
              object-fit: cover;
            }
            .photo-placeholder {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              border: 2px solid white;
              background: rgba(255, 255, 255, 0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: bold;
            }
            .divider {
              border-top: 1px solid rgba(255, 255, 255, 0.3);
              padding-top: 16px;
              margin-top: 16px;
            }
            .card-body {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .user-info h3 {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .user-info p {
              font-size: 12px;
              opacity: 0.9;
              margin-bottom: 8px;
            }
            .membership-badge {
              background: rgba(255, 255, 255, 0.2);
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              margin-top: 8px;
            }
            .qr-code {
              background: white;
              padding: 8px;
              border-radius: 4px;
            }
            .qr-code img {
              width: 80px;
              height: 80px;
            }
            .card-footer {
              margin-top: 24px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              font-size: 12px;
            }
            .footer-item {
              text-align: left;
            }
            .footer-item div:first-child {
              color: #d1d5db;
              font-size: 11px;
            }
            .footer-item div:last-child {
              font-weight: bold;
              font-size: 13px;
            }
            @media print {
              body {
                background: white;
              }
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <div class="card-header">
              <div class="logo-section">
                <div>
                  <h2>ABSSD</h2>
                  <p>Member ID Card</p>
                </div>
              </div>
              ${photoPreview || (user.photo ? `<img src="${getImageUrl(user.photo)}" alt="Profile" class="photo" />` : `<div class="photo-placeholder">${user.username?.charAt(0).toUpperCase() || 'U'}</div>`)}
            </div>
            
            <div class="divider">
              <div class="card-body">
                <div class="user-info">
                  <h3>${user.username}</h3>
                  <p>📧 ${user.email}</p>
                  <p>📞 ${user.contactNo}</p>
                  ${user.membershipStatus ? `<div class="membership-badge">${user.membershipStatus === 'active' ? 'Active Member' : 'Pending'}</div>` : ''}
                </div>
                <div class="qr-code">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(user._id)}&size=100x100" alt="QR Code" />
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="footer-item">
                <div>Membership Type</div>
                <div>${user.membershipType === 'annual' ? 'Annual' : 'Lifetime'}</div>
              </div>
              <div class="footer-item">
                <div>Member Since</div>
                <div>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
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
console.log({user})
  const photoUrl = user.photo ? getImageUrl(user.photo) : null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
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
              <div className="max-w-md mx-auto">
                <div ref={printRef} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3 notranslate" translate="no">
                      <Logo size="lg" className="bg-white/20 rounded-full p-2" />
                      <div>
                        <h2 className="text-2xl font-bold mb-1">ABSSD</h2>
                        <p className="text-sm opacity-90">Member ID Card</p>
                      </div>
                    </div>
                    <div className="relative group">
                      {photoPreview || photoUrl ? (
                        <img
                          src={photoPreview || photoUrl}
                          alt="Profile"
                          className="w-20 h-20 rounded-full border-2 border-white object-cover"
                          loading='lazy'
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-white bg-white/20 flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className='flex w-full justify-between'>

                  <div className="border-t border-white/30 pt-4 mt-4">
                    <div className="text-lg font-semibold mb-1">{user.username}</div>
                    <div className="text-sm opacity-90 mb-2">📧 {user.email}</div>
                    <div className="text-sm">
                      <div className="mb-1">📞 {user.contactNo}</div>
                      {user.membershipStatus && (
                        <div className="mt-2">
                          <span className="bg-white/20 px-2 py-1 rounded text-xs">
                            {user.membershipStatus === 'active' ? 'Active Member' : user.membershipStatus === 'cancelled' ? 'Membership Cancelled' : 'Approval Pending'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QR Code - Bottom Left */}
                  <div className="mt-4 flex items-end">
                    <div className="bg-white p-2 rounded">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(user._id)}&size=100x100`}
                        alt="Member QR Code"
                        className="w-10 h-10"
                      />
                    </div>
                  </div>
                  </div>
                  
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Membership Type</div>
                    <div className="font-semibold">
                      {user.membershipType === 'annual' ? 'Annual' : 'Lifetime'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Member Since</div>
                    <div className="font-semibold">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </div>
                  </div>
                </div>
                
                {/* Print Button */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handlePrintCard}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    प्रिंट करें / Print
                  </button>
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
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                      Verify Email
                    </button>
                  )}
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

          {/* Logout Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 font-semibold"
            >
              लॉगआउट करें / Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

