import { useState, useRef, useEffect, useCallback } from 'react'
import { getImageUrl } from '../../utils/imageUrl.js'
import IDCard from '../IDCard.jsx'
import client from '../../api/client.js'
import Cropper from 'react-easy-crop'

const UserDetailsModal = ({ user, onClose, onUpdateStatus, onNotify, onToggleAdmin, onDelete, onToggleTeamLeader, positions = [], onTogglePosition, onUserUpdated }) => {
  const [notificationForm, setNotificationForm] = useState({
    subject: '',
    message: '',
  })
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [tempPreviewUrl, setTempPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(user?.position?._id || '')
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showIdCard, setShowIdCard] = useState(false)
  const printRef = useRef(null)

  if (!user) return null

  useEffect(() => {
    // initialize form when modal opens or user changes
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        contactNo: user.contactNo || '',
        fatherName: user.fatherName || '',
        motherName: user.motherName || '',
        occupation: user.occupation || '',
        qualification: user.qualification || '',
        moreDetails: user.moreDetails || '',
        address: user.address && typeof user.address === 'object' ? { ...user.address } : { street: '', city: '', state: '', pincode: '', country: 'India' },
      })
      setPreviewUrl(user.photo ? getImageUrl(user.photo) : '')
      setSelectedFile(null)
      setEditMode(false)
    }
  }, [user])

  const handleStatusUpdate = async (newStatus) => {
    if (confirm(`Are you sure you want to ${newStatus} this membership?`)) {
      setLoading(true)
      await onUpdateStatus(user._id, newStatus)
      setLoading(false)
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()
    if (!notificationForm.subject || !notificationForm.message) {
      alert('Please fill in both subject and message')
      return
    }
    setLoading(true)
    await onNotify(user._id, notificationForm)
    setNotificationForm({ subject: '', message: '' })
    setShowNotificationForm(false)
    setLoading(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Handle simple file selection and open crop modal
  const handleFileInput = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setTempPreviewUrl(url)
    setShowCropModal(true)
    setSelectedFile(f)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
  }

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  // Utility: create Image element from URL
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(e)
      img.src = url
    })

  // Get cropped image blob and apply circular mask
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // set canvas to cropped size
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    // create circular mask on a new canvas
    const circCanvas = document.createElement('canvas')
    const cctx = circCanvas.getContext('2d')
    const size = Math.max(pixelCrop.width, pixelCrop.height)
    circCanvas.width = size
    circCanvas.height = size

    // fill transparent
    cctx.clearRect(0, 0, size, size)
    // draw circle
    cctx.save()
    cctx.beginPath()
    cctx.arc(size / 2, size / 2, Math.min(pixelCrop.width, pixelCrop.height) / 2, 0, 2 * Math.PI)
    cctx.closePath()
    cctx.clip()

    // draw the cropped image centered into circCanvas
    const dx = (size - pixelCrop.width) / 2
    const dy = (size - pixelCrop.height) / 2
    cctx.drawImage(canvas, dx, dy)
    cctx.restore()

    return new Promise((resolve) => {
      circCanvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    })
  }

  const applyCrop = async () => {
    if (!tempPreviewUrl || !selectedFile || !croppedAreaPixels) return
    try {
      const blob = await getCroppedImg(tempPreviewUrl, croppedAreaPixels)
      const file = new File([blob], selectedFile.name || 'photo.png', { type: 'image/png' })
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } catch (err) {
      console.error('Crop failed', err)
      alert('Failed to crop image')
    } finally {
      setShowCropModal(false)
      if (tempPreviewUrl) { URL.revokeObjectURL(tempPreviewUrl); setTempPreviewUrl('') }
    }
  }

  const cancelCrop = () => {
    if (tempPreviewUrl) { URL.revokeObjectURL(tempPreviewUrl); setTempPreviewUrl('') }
    setShowCropModal(false)
    setSelectedFile(null)
  }

  const handleSaveChanges = async () => {
    if (!form) return
    setSaving(true)
    try {
      const body = new FormData()
      body.append('username', form.username || '')
      body.append('email', form.email || '')
      body.append('contactNo', form.contactNo || '')
      body.append('fatherName', form.fatherName || '')
      body.append('motherName', form.motherName || '')
      body.append('occupation', form.occupation || '')
      body.append('qualification', form.qualification || '')
      body.append('moreDetails', form.moreDetails || '')
      body.append('address', JSON.stringify(form.address || {}))

      if (selectedFile) {
        // If selectedFile is already a cropped File (from applyCrop), append directly.
        if (selectedFile instanceof File && previewUrl && previewUrl.startsWith('blob:')) {
          body.append('photo', selectedFile)
        } else {
          const blob = await createCroppedBlob()
          const f = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
          body.append('photo', f)
        }
      }

      const res = await client(`/auth/users/${user._id}`, { method: 'PUT', body })
      alert('User updated successfully')
      if (onUserUpdated) onUserUpdated(res.data)
      else onClose()
    } catch (err) {
      console.error('save user error', err)
      alert(err.message || 'Failed to update user')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setEditMode(!editMode)} className="text-sm bg-gray-100 px-3 py-1 rounded">{editMode ? 'Cancel Edit' : 'Edit'}</button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Optionally show ID card */}
          {showIdCard && (
            <div className="mb-16 mt-8">
              <div className="flex justify-end mb-3 gap-2">
                <button onClick={() => {
                  // print
                  try {
                    const node = printRef.current
                    if (!node) return
                    const printWindow = window.open('', '_blank')
                    if (!printWindow) { alert('Please allow popups for this site to enable printing'); return }
                    const headNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
                    const headHtml = headNodes.map((n) => n.outerHTML).join('\n')
                    const cardHtml = node.outerHTML
                    printWindow.document.open()
                    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8" />${headHtml}<style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f3f4f6;padding:20px}.card-container{box-shadow:none!important}</style></head><body>${cardHtml}</body></html>`)
                    printWindow.document.close()
                    printWindow.focus()
                    setTimeout(() => { printWindow.print(); printWindow.close() }, 300)
                  } catch (err) { console.error('Print error', err); alert('Unable to open print window') }
                }} className="bg-blue-500 text-white px-3 py-2 rounded">Print</button>
                <button onClick={() => setShowIdCard(false)} className="bg-gray-200 text-gray-800 px-3 py-2 rounded">Close</button>
              </div>
              <div className="flex justify-center">
                <IDCard ref={printRef} user={user} />
              </div>
            </div>
          )}
          {/* Crop Modal */}
          {showCropModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-white rounded-lg max-w-4xl w-full p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Crop Photo</h4>
                  <button onClick={cancelCrop} className="text-gray-500">✕</button>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-gray-50 p-2 relative" style={{ height: 420 }}>
                    {tempPreviewUrl ? (
                      <div className="relative w-full h-full bg-black">
                        <Cropper
                          image={tempPreviewUrl}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          cropShape="round"
                          showGrid={false}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                      </div>
                    ) : (
                      <div className="text-gray-500">No preview</div>
                    )}
                  </div>
                  <div className="w-56 flex-shrink-0">
                    <label className="block text-sm text-gray-700 mb-2">Zoom</label>
                    <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
                    <div className="text-sm text-gray-600 mt-2">Zoom: {zoom.toFixed(2)}</div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={applyCrop} className="bg-green-600 text-white px-3 py-2 rounded">Apply</button>
                      <button onClick={cancelCrop} className="bg-gray-200 px-3 py-2 rounded">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Profile Section */}
          <div className="flex items-start gap-6 mb-6 pb-6 border-b">
            <div className="flex-shrink-0">
              {previewUrl ? (
                <img src={previewUrl} alt={user.username} className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              {editMode && (
                <div className="mt-2">
                  <input type="file" accept="image/*" onChange={(e) => handleFileInput(e)} />
                </div>
              )}
            </div>
            <div className="flex-1">
              {!editMode ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{user.username}</h3>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                </>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Full name</label>
                    <input className="w-full border px-3 py-2 rounded" value={form?.username || ''} onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Email</label>
                    <input className="w-full border px-3 py-2 rounded" value={form?.email || ''} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-center mt-2">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                    user.membershipStatus
                  )}`}
                >
                  {user.membershipStatus?.charAt(0).toUpperCase() + user.membershipStatus?.slice(1)}
                </span>
                {user.role === 'admin' && (
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Personal Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Contact No:</span>
                  <span className="ml-2 text-gray-900">{user.contactNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Member No.:</span>
                  <span className="ml-2 text-gray-900">{user.memberNumber ? `#${user.memberNumber}` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date of Birth:</span>
                  <span className="ml-2 text-gray-900">
                    {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <span className="ml-2 text-gray-900">{user.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Father's Name:</span>
                  <span className="ml-2 text-gray-900">{user.fatherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Mother's Name:</span>
                  <span className="ml-2 text-gray-900">{user.motherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Aadhar No:</span>
                  <span className="ml-2 text-gray-900">{user.aadharNo || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Additional Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Address:</span>
                  <div className="ml-2 text-gray-900">
                    {user.address ? (
                      typeof user.address === 'object' ? (
                        <div className="text-sm">
                          {user.address.street && <div>{user.address.street}</div>}
                          {user.address.city && user.address.state && (
                            <div>{user.address.city}, {user.address.state}</div>
                          )}
                          {user.address.pincode && <div>{user.address.pincode}</div>}
                          {user.address.country && <div>{user.address.country}</div>}
                        </div>
                      ) : (
                        user.address
                      )
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Qualification:</span>
                  <span className="ml-2 text-gray-900">{user.qualification || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Occupation:</span>
                  <span className="ml-2 text-gray-900">{user.occupation || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Membership Type:</span>
                  <span className="ml-2 text-gray-900">
                    {user.membershipType === 'annual' ? 'Annual' : 'Ordinary'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Membership Amount:</span>
                  <span className="ml-2 text-gray-900">
                    {user.membershipAmount ? `₹${user.membershipAmount}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Joined:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {user.moreDetails && (
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-700 mb-2">Additional Details</h4>
              <p className="text-sm text-gray-600">{user.moreDetails}</p>
            </div>
          )}

          {/* Uploaded documents (Aadhaar front/back) */}
          {(user.aadharFront || user.aadharBack || user.photo) && (
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-700 mb-2">Uploaded Documents</h4>
              <div className="flex flex-wrap gap-4">
                {user.aadharFront ? (
                  <div className="w-44">
                    <div className="text-sm text-gray-500 mb-1">Aadhaar Front</div>
                    <a href={getImageUrl(user.aadharFront)} target="_blank" rel="noreferrer" className="block">
                      <img src={getImageUrl(user.aadharFront)} alt={`${user.username}-aadhar-front`} className="w-44 h-28 object-cover rounded border" />
                    </a>
                    <div className="text-xs text-gray-500 mt-1">
                      <a href={getImageUrl(user.aadharFront)} target="_blank" rel="noreferrer" className="underline">Open</a>
                      {' • '}
                      <a href={getImageUrl(user.aadharFront)} download className="underline">Download</a>
                    </div>
                  </div>
                ) : null}

                {user.aadharBack ? (
                  <div className="w-44">
                    <div className="text-sm text-gray-500 mb-1">Aadhaar Back</div>
                    <a href={getImageUrl(user.aadharBack)} target="_blank" rel="noreferrer" className="block">
                      <img src={getImageUrl(user.aadharBack)} alt={`${user.username}-aadhar-back`} className="w-44 h-28 object-cover rounded border" />
                    </a>
                    <div className="text-xs text-gray-500 mt-1">
                      <a href={getImageUrl(user.aadharBack)} target="_blank" rel="noreferrer" className="underline">Open</a>
                      {' • '}
                      <a href={getImageUrl(user.aadharBack)} download className="underline">Download</a>
                    </div>
                  </div>
                ) : null}

                {/* Optionally show profile photo link again for convenience */}
                {user.photo && (
                  <div className="w-44">
                    <div className="text-sm text-gray-500 mb-1">Profile Photo</div>
                    <a href={getImageUrl(user.photo)} target="_blank" rel="noreferrer" className="block">
                      <img src={getImageUrl(user.photo)} alt={`${user.username}-photo`} className="w-44 h-28 object-cover rounded border" />
                    </a>
                    <div className="text-xs text-gray-500 mt-1">
                      <a href={getImageUrl(user.photo)} target="_blank" rel="noreferrer" className="underline">Open</a>
                      {' • '}
                      <a href={getImageUrl(user.photo)} download className="underline">Download</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Actions</h4>

            {/* Inline edit form when in edit mode */}
            {editMode && form && (
              <div className="mb-4 bg-gray-50 p-4 rounded">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700">Contact No</label>
                    <input value={form.contactNo || ''} onChange={(e) => setForm((s) => ({ ...s, contactNo: e.target.value }))} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Occupation</label>
                    <input value={form.occupation || ''} onChange={(e) => setForm((s) => ({ ...s, occupation: e.target.value }))} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Father's Name</label>
                    <input value={form.fatherName || ''} onChange={(e) => setForm((s) => ({ ...s, fatherName: e.target.value }))} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Mother's Name</label>
                    <input value={form.motherName || ''} onChange={(e) => setForm((s) => ({ ...s, motherName: e.target.value }))} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700">Qualification</label>
                    <input value={form.qualification || ''} onChange={(e) => setForm((s) => ({ ...s, qualification: e.target.value }))} className="w-full border px-3 py-2 rounded" />
                  </div>

                  {/* Address fields */}
                  <div>
                    <label className="block text-sm text-gray-700">Street</label>
                    <input value={form.address?.street || ''} onChange={(e) => setForm((s) => ({ ...s, address: { ...s.address, street: e.target.value } }))} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">City</label>
                    <input value={form.address?.city || ''} onChange={(e) => setForm((s) => ({ ...s, address: { ...s.address, city: e.target.value } }))} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">State</label>
                    <input value={form.address?.state || ''} onChange={(e) => setForm((s) => ({ ...s, address: { ...s.address, state: e.target.value } }))} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Pincode</label>
                    <input value={form.address?.pincode || ''} onChange={(e) => setForm((s) => ({ ...s, address: { ...s.address, pincode: e.target.value } }))} className="w-full border px-3 py-2 rounded" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Position assignment (admin) */}
            {Array.isArray(positions) && positions.length > 0 && typeof onTogglePosition === 'function' && (
              <div className="mb-4 bg-gray-50 p-3 rounded">
                <label className="block text-sm text-gray-700 mb-2">Assign Position</label>
                <div className="flex items-center gap-2">
                  <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} className="px-3 py-2 border rounded-lg">
                    <option value="">-- None --</option>
                    {positions.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  <button onClick={async () => {
                    setLoading(true)
                    await onTogglePosition(user._id, selectedPosition || undefined)
                    setLoading(false)
                  }} className="bg-indigo-600 text-white px-3 py-2 rounded">Save</button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {!showIdCard && (
                <button
                  onClick={() => setShowIdCard(true)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  👀 View ID CARD
                </button>
              )}
              {user.membershipStatus === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('active')}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ Approve Membership
                </button>
              )}
              {/* Team Leader toggle (admin only) */}
              {typeof onToggleTeamLeader === 'function' && (
                user.isTeamLeader ? (
                  <button
                    onClick={async () => {
                      if (!confirm(`Revoke team leader status from ${user.username}?`)) return
                      setLoading(true)
                      await onToggleTeamLeader(user._id, false)
                      setLoading(false)
                    }}
                    disabled={loading}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✖ Revoke Team Leader
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      if (!confirm(`Make ${user.username} a team leader? This will generate a referral code for them.`)) return
                      setLoading(true)
                      await onToggleTeamLeader(user._id, true)
                      setLoading(false)
                    }}
                    disabled={loading}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ⭐ Make Team Leader
                  </button>
                )
              )}
              
              {user.membershipStatus === 'active' && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✕ Cancel Membership
                </button>
              )}

              {user.membershipStatus === 'cancelled' && (
                <button
                  onClick={() => handleStatusUpdate('active')}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↻ Reactivate Membership
                </button>
              )}

              <button
                onClick={() => setShowNotificationForm(!showNotificationForm)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                📧 Send Email Notification
              </button>

              {/* Toggle Admin Role */}
              {onToggleAdmin && (
                user.role !== 'admin' ? (
                  <button
                    onClick={async () => {
                      if (!confirm(`Make ${user.username} an admin? This will grant full admin privileges.`)) return
                      setLoading(true)
                      await onToggleAdmin(user._id, true)
                      setLoading(false)
                    }}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    👑 Make Admin
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      if (!confirm(`Revoke admin access from ${user.username}?`)) return
                      setLoading(true)
                      await onToggleAdmin(user._id, false)
                      setLoading(false)
                    }}
                    disabled={loading}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ⛔ Revoke Admin
                  </button>
                )
              )}

              {/* Delete User (admin only) */}
              {typeof onDelete === 'function' && (
                <button
                  onClick={async () => {
                    if (!confirm(`Permanently delete user ${user.username}? This cannot be undone.`)) return
                    setLoading(true)
                    await onDelete(user._id)
                    setLoading(false)
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  🗑️ Delete User
                </button>
              )}
            </div>

            {/* Notification Form */}
            {showNotificationForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold mb-3">Send Email to {user.email}</h5>
                <form onSubmit={handleSendNotification} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={notificationForm.subject}
                      onChange={(e) =>
                        setNotificationForm({ ...notificationForm, subject: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Email subject"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={notificationForm.message}
                      onChange={(e) =>
                        setNotificationForm({ ...notificationForm, message: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="4"
                      placeholder="Email message"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending...' : 'Send Email'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotificationForm(false)
                        setNotificationForm({ subject: '', message: '' })
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailsModal
