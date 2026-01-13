import { useState } from 'react'
import { getImageUrl } from '../../utils/imageUrl.js'

const UserDetailsModal = ({ user, onClose, onUpdateStatus, onNotify, onToggleAdmin, onDelete}) => {
  const [notificationForm, setNotificationForm] = useState({
    subject: '',
    message: '',
  })
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user) return null

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex items-start gap-6 mb-6 pb-6 border-b">
            <div className="flex-shrink-0">
              {user.photo ? (
                <img
                  src={getImageUrl(user.photo)}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{user.username}</h3>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="flex gap-2 items-center">
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
                    {user.membershipType === 'annual' ? 'Annual' : 'Lifetime'}
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

          {/* Action Buttons */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Actions</h4>
            
            <div className="flex flex-wrap gap-3">
              {user.membershipStatus === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('active')}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ Approve Membership
                </button>
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
