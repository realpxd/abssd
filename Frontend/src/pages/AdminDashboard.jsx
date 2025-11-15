import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import client from '../api/client.js'
import api from '../api/config.js'

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('gallery')
  const [galleryItems, setGalleryItems] = useState([])
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form states
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    titleEn: '',
    description: '',
    category: 'cleanliness',
    imageUrl: '',
    imageFile: null,
  })

  const [newsForm, setNewsForm] = useState({
    title: '',
    titleEn: '',
    description: '',
    date: '',
    location: '',
    imageUrl: '',
    imageFile: null,
  })

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    fetchData()
  }, [activeTab, isAdmin, navigate])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'gallery') {
        const response = await client(api.endpoints.gallery, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        setGalleryItems(response.data || [])
      } else {
        const response = await client(api.endpoints.events, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        setNewsItems(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handleGallerySubmit = async (e, id = null) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('title', galleryForm.title)
      formData.append('titleEn', galleryForm.titleEn)
      formData.append('description', galleryForm.description)
      formData.append('category', galleryForm.category)
      if (galleryForm.imageFile) {
        formData.append('image', galleryForm.imageFile)
      } else if (galleryForm.imageUrl && !id) {
        formData.append('imageUrl', galleryForm.imageUrl)
      } else if (galleryForm.imageUrl && id) {
        // For updates, send imageUrl in body if no new file
        const updateData = {
          title: galleryForm.title,
          titleEn: galleryForm.titleEn,
          description: galleryForm.description,
          category: galleryForm.category,
          imageUrl: galleryForm.imageUrl,
        }
        await client(api.endpoints.gallery + `/${id}`, {
          method: 'PUT',
          body: updateData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        resetGalleryForm()
        fetchData()
        return
      }

      if (id) {
        await client(api.endpoints.gallery + `/${id}`, {
          method: 'PUT',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      } else {
        await client(api.endpoints.gallery, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      }

      resetGalleryForm()
      fetchData()
    } catch (error) {
      alert(error.message || 'Error saving gallery item')
    }
  }

  const handleNewsSubmit = async (e, id = null) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('title', newsForm.title)
      formData.append('titleEn', newsForm.titleEn)
      formData.append('description', newsForm.description)
      formData.append('date', newsForm.date)
      formData.append('location', newsForm.location)
      if (newsForm.imageFile) {
        formData.append('image', newsForm.imageFile)
      } else if (newsForm.imageUrl && !id) {
        formData.append('imageUrl', newsForm.imageUrl)
      } else if (newsForm.imageUrl && id) {
        // For updates, send imageUrl in body if no new file
        const updateData = {
          title: newsForm.title,
          titleEn: newsForm.titleEn,
          description: newsForm.description,
          date: newsForm.date,
          location: newsForm.location,
          imageUrl: newsForm.imageUrl,
        }
        await client(api.endpoints.events + `/${id}`, {
          method: 'PUT',
          body: updateData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        resetNewsForm()
        fetchData()
        return
      }

      if (id) {
        await client(api.endpoints.events + `/${id}`, {
          method: 'PUT',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      } else {
        await client(api.endpoints.events, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      }

      resetNewsForm()
      fetchData()
    } catch (error) {
      alert(error.message || 'Error saving news item')
    }
  }

  const handleDelete = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type} item?`)) return

    try {
      const endpoint = type === 'gallery' ? api.endpoints.gallery : api.endpoints.events
      await client(endpoint + `/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      fetchData()
    } catch (error) {
      alert(error.message || 'Error deleting item')
    }
  }

  const startEdit = (item, type) => {
    if (type === 'gallery') {
      setGalleryForm({
        title: item.title || '',
        titleEn: item.titleEn || '',
        description: item.description || '',
        category: item.category || 'cleanliness',
        imageUrl: item.imageUrl || '',
        imageFile: null,
      })
      setEditingId(item._id)
    } else {
      setNewsForm({
        title: item.title || '',
        titleEn: item.titleEn || '',
        description: item.description || '',
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        location: item.location || '',
        imageUrl: item.imageUrl || '',
        imageFile: null,
      })
      setEditingId(item._id)
    }
    setShowAddForm(true)
  }

  const resetGalleryForm = () => {
    setGalleryForm({
      title: '',
      titleEn: '',
      description: '',
      category: 'cleanliness',
      imageUrl: '',
      imageFile: null,
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  const resetNewsForm = () => {
    setNewsForm({
      title: '',
      titleEn: '',
      description: '',
      date: '',
      location: '',
      imageUrl: '',
      imageFile: null,
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.username || 'Admin'}</p>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          <button
            onClick={() => {
              setActiveTab('gallery')
              resetGalleryForm()
            }}
            className={`px-6 py-3 font-medium ${
              activeTab === 'gallery'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Gallery Management
          </button>
          <button
            onClick={() => {
              setActiveTab('news')
              resetNewsForm()
            }}
            className={`px-6 py-3 font-medium ${
              activeTab === 'news'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            News Management
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit' : 'Add New'} {activeTab === 'gallery' ? 'Gallery Item' : 'News Item'}
              </h2>
              <button
                onClick={() => {
                  activeTab === 'gallery' ? resetGalleryForm() : resetNewsForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {activeTab === 'gallery' ? (
              <form onSubmit={(e) => handleGallerySubmit(e, editingId)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (Hindi)</label>
                    <input
                      type="text"
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
                    <input
                      type="text"
                      value={galleryForm.titleEn}
                      onChange={(e) => setGalleryForm({ ...galleryForm, titleEn: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={galleryForm.category}
                    onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="cleanliness">Cleanliness</option>
                    <option value="water-service">Water Service</option>
                    <option value="toilet-management">Toilet Management</option>
                    <option value="fair-service">Fair Service</option>
                    <option value="ekadashi">Ekadashi</option>
                    <option value="environment">Environment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingId && !galleryForm.imageFile ? 'Image URL (or upload new image)' : 'Upload Image'}
                  </label>
                  {!editingId || galleryForm.imageFile ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setGalleryForm({ ...galleryForm, imageFile: e.target.files[0] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required={!editingId}
                    />
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={galleryForm.imageUrl}
                        onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                        placeholder="Image URL"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                      />
                      <button
                        type="button"
                        onClick={() => setGalleryForm({ ...galleryForm, imageFile: null, imageUrl: '' })}
                        className="text-sm text-orange-600 hover:text-orange-700"
                      >
                        Or upload new image
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setGalleryForm({ ...galleryForm, imageFile: e.target.files[0], imageUrl: '' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                  >
                    {editingId ? 'Update' : 'Add'} Item
                  </button>
                  <button
                    type="button"
                    onClick={resetGalleryForm}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={(e) => handleNewsSubmit(e, editingId)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (Hindi)</label>
                    <input
                      type="text"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
                    <input
                      type="text"
                      value={newsForm.titleEn}
                      onChange={(e) => setNewsForm({ ...newsForm, titleEn: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newsForm.description}
                    onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="4"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={newsForm.date}
                      onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={newsForm.location}
                      onChange={(e) => setNewsForm({ ...newsForm, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingId && !newsForm.imageFile ? 'Image URL (or upload new image)' : 'Upload Image'}
                  </label>
                  {!editingId || newsForm.imageFile ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewsForm({ ...newsForm, imageFile: e.target.files[0] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newsForm.imageUrl}
                        onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                        placeholder="Image URL"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                      />
                      <button
                        type="button"
                        onClick={() => setNewsForm({ ...newsForm, imageFile: null, imageUrl: '' })}
                        className="text-sm text-orange-600 hover:text-orange-700"
                      >
                        Or upload new image
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewsForm({ ...newsForm, imageFile: e.target.files[0], imageUrl: '' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                  >
                    {editingId ? 'Update' : 'Add'} News
                  </button>
                  <button
                    type="button"
                    onClick={resetNewsForm}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <button
            onClick={() => {
              activeTab === 'gallery' ? resetGalleryForm() : resetNewsForm()
              setShowAddForm(true)
            }}
            className="mb-6 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
          >
            + Add New {activeTab === 'gallery' ? 'Gallery Item' : 'News Item'}
          </button>
        )}

        {/* Items List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : activeTab === 'gallery' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/400x300'}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.titleEn}</p>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(item, 'gallery')}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, 'gallery')}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {newsItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex gap-6">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-2">{item.titleEn}</p>
                    <p className="text-gray-700 mb-4">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                      {item.location && <span>📍 {item.location}</span>}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(item, 'news')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, 'news')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

