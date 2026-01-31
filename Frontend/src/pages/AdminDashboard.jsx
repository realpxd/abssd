import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import api from '../api/config.js';
import AdminHeader from '../components/admin/AdminHeader.jsx';
import TabNavigation from '../components/admin/TabNavigation.jsx';
import FormModal from '../components/admin/FormModal.jsx';
import GalleryForm from '../components/admin/GalleryForm.jsx';
import AdminCreateUser from '../components/admin/AdminCreateUser.jsx';
import NewsForm from '../components/admin/NewsForm.jsx';
import GalleryCard from '../components/admin/GalleryCard.jsx';
import NewsCard from '../components/admin/NewsCard.jsx';
import LoadingSpinner from '../components/admin/LoadingSpinner.jsx';
import UsersList from '../components/admin/UsersList.jsx';
import UserDetailsModal from '../components/admin/UserDetailsModal.jsx';
import SEO from '../components/SEO.jsx';

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryItems, setGalleryItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [gallerySubmitting, setGallerySubmitting] = useState(false);
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters for users list
  const [filterPosition, setFilterPosition] = useState('');
  const [filterReferredBy, setFilterReferredBy] = useState('');
  const [filterMembershipType, setFilterMembershipType] = useState('');
  const [filterMembershipStatus, setFilterMembershipStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Admin create-user handled inside AdminCreateUser component

  // Form states
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    titleEn: '',
    description: '',
    category: 'cleanliness',
    imageUrl: '',
    imageFile: null,
  });

  const [newsForm, setNewsForm] = useState({
    title: '',
    titleEn: '',
    description: '',
    date: '',
    location: '',
    imageUrl: '',
    imageFile: null,
  });

  // stable fetchData to avoid re-creating on every render
  const mountedRef = useRef(true);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'gallery') {
        const response = await client(api.endpoints.gallery, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!mountedRef.current) return;
        setGalleryItems(response.data || []);
      } else if (activeTab === 'news') {
        const response = await client(api.endpoints.events, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!mountedRef.current) return;
        setNewsItems(response.data || []);
      } else if (
        activeTab === 'users' ||
        activeTab === 'create-user' ||
        activeTab === 'positions'
      ) {
        const response = await client(api.endpoints.users, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!mountedRef.current) return;
        setUsers(response.data || []);
        // Fetch positions for admin to assign
        try {
          const posResp = await client(api.endpoints.positions);
          if (!mountedRef.current) return;
          if (posResp && posResp.data) setPositions(posResp.data);
        } catch (err) {
          // ignore
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    mountedRef.current = true;
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [activeTab, isAdmin, navigate, fetchData]);

  // debounce search to avoid excessive filtering on every keystroke
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(userSearchQuery.trim().toLowerCase()),
      300,
    );
    return () => clearTimeout(t);
  }, [userSearchQuery]);

  // memoized filtered users list
  const filteredUsers = useMemo(() => {
    const q = debouncedSearch || '';
    return users.filter((u) => {
      if (q) {
        const matches =
          (u._id || '').toLowerCase().includes(q) ||
          (u.username || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterPosition) {
        const posId =
          u.position && typeof u.position === 'object'
            ? u.position._id
            : u.position;
        if (String(posId) !== String(filterPosition)) return false;
      }
      if (filterReferredBy) {
        const refId =
          u.referredBy && typeof u.referredBy === 'object'
            ? u.referredBy._id
            : u.referredBy;
        if (String(refId) !== String(filterReferredBy)) return false;
      }
      if (filterMembershipType) {
        if ((u.membershipType || '') !== filterMembershipType) return false;
      }
      if (filterMembershipStatus) {
        if ((u.membershipStatus || '') !== filterMembershipStatus) return false;
      }
      if (filterRole) {
        if ((u.role || '') !== filterRole) return false;
      }
      return true;
    });
  }, [
    users,
    debouncedSearch,
    filterPosition,
    filterReferredBy,
    filterMembershipType,
    filterMembershipStatus,
    filterRole,
  ]);

  // Export users to CSV or Excel
  const handleExportUsers = async (format = 'csv') => {
    try {
      setLoading(true);
      // Fetch latest users from server to ensure complete list
      const resp = await client(api.endpoints.users, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const allUsers = resp.data || [];

      if (!allUsers.length) {
        alert('No users to export');
        return;
      }

      // Prepare headers and rows as arrays (AOA)
      const headers = [
        'Member Number',
        'User ID',
        'Username',
        'Email',
        'Contact No',
        'Membership Status',
        'Position',
        'Referred By',
        'Referral Code',
        'Is Team Leader',
        'Role',
        'DOB',
        'Address',
        'Qualification',
        'Occupation',
        'Aadhar Verified',
        'Membership Amount',
        'Payment ID',
        'Is Email Verified',
        'Created At',
      ];

      const makeAddress = (u) => {
        if (!u.address) return '';
        if (typeof u.address === 'string') return u.address;
        const parts = [];
        if (u.address.street) parts.push(u.address.street);
        if (u.address.city) parts.push(u.address.city);
        if (u.address.state) parts.push(u.address.state);
        if (u.address.pincode) parts.push(u.address.pincode);
        return parts.join(', ');
      };

      const rows = allUsers.map((u) => {
        const pos =
          u.position && typeof u.position === 'object'
            ? u.position.name || ''
            : u.position || '';
        const referred =
          u.referredBy && typeof u.referredBy === 'object'
            ? u.referredBy.username || ''
            : u.referredBy || '';
        return [
          u.memberNumber || '',
          u._id,
          u.username,
          u.email,
          u.contactNo,
          u.membershipStatus || '',
          pos,
          referred,
          u.referralCode || '',
          u.isTeamLeader ? 'Yes' : 'No',
          u.role || '',
          u.dob ? new Date(u.dob).toISOString().split('T')[0] : '',
          makeAddress(u),
          u.qualification || '',
          u.occupation || '',
          u.aadharVerified ? 'Yes' : 'No',
          typeof u.membershipAmount !== 'undefined' &&
          u.membershipAmount !== null
            ? u.membershipAmount
            : '',
          u.paymentId || '',
          u.isEmailVerified ? 'Yes' : 'No',
          u.createdAt ? new Date(u.createdAt).toISOString() : '',
        ];
      });

      if (format === 'csv') {
        // CSV (Excel-friendly)
        const escapeCell = (v) => {
          if (v === null || typeof v === 'undefined') return '';
          const s = String(v);
          return '"' + s.replace(/"/g, '""') + '"';
        };
        const csvContent =
          '\uFEFF' +
          [
            headers.map(escapeCell).join(','),
            ...rows.map((r) => r.map(escapeCell).join(',')),
          ].join('\n');
        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abssd_users_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        // Excel (.xlsx) using SheetJS (dynamic import)
        let XLSX;
        try {
          XLSX = await import('xlsx');
        } catch (e) {
          alert(
            'Excel export requires the "xlsx" package. Run "npm install xlsx" in the Frontend folder and rebuild.',
          );
          return;
        }
        const aoa = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abssd_users_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export users failed', err);
      alert(err.message || 'Failed to export users');
    } finally {
      setLoading(false);
    }
  };

  const handleGallerySubmit = async (e, id = null) => {
    e.preventDefault();
    setGallerySubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', galleryForm.title);
      formData.append('titleEn', galleryForm.titleEn);
      formData.append('description', galleryForm.description);
      formData.append('category', galleryForm.category);
      if (galleryForm.imageFile) {
        formData.append('image', galleryForm.imageFile);
      } else if (galleryForm.imageUrl && !id) {
        formData.append('imageUrl', galleryForm.imageUrl);
      } else if (galleryForm.imageUrl && id) {
        const updateData = {
          title: galleryForm.title,
          titleEn: galleryForm.titleEn,
          description: galleryForm.description,
          category: galleryForm.category,
          imageUrl: galleryForm.imageUrl,
        };
        await client(api.endpoints.gallery + `/${id}`, {
          method: 'PUT',
          body: updateData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        resetGalleryForm();
        fetchData();
        return;
      }

      if (id) {
        await client(api.endpoints.gallery + `/${id}`, {
          method: 'PUT',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        await client(api.endpoints.gallery, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      resetGalleryForm();
      fetchData();
    } catch (error) {
      alert(error.message || 'Error saving gallery item');
    } finally {
      setGallerySubmitting(false);
    }
  };

  const handleNewsSubmit = async (e, id = null) => {
    e.preventDefault();
    setNewsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', newsForm.title);
      formData.append('titleEn', newsForm.titleEn);
      formData.append('description', newsForm.description);
      formData.append('date', newsForm.date);
      formData.append('location', newsForm.location);
      if (newsForm.imageFile) {
        formData.append('image', newsForm.imageFile);
      } else if (newsForm.imageUrl && !id) {
        formData.append('imageUrl', newsForm.imageUrl);
      } else if (newsForm.imageUrl && id) {
        // For updates, send imageUrl in body if no new file
        const updateData = {
          title: newsForm.title,
          titleEn: newsForm.titleEn,
          description: newsForm.description,
          date: newsForm.date,
          location: newsForm.location,
          imageUrl: newsForm.imageUrl,
        };
        await client(api.endpoints.events + `/${id}`, {
          method: 'PUT',
          body: updateData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        resetNewsForm();
        fetchData();
        return;
      }

      if (id) {
        await client(api.endpoints.events + `/${id}`, {
          method: 'PUT',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        await client(api.endpoints.events, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      resetNewsForm();
      fetchData();
    } catch (error) {
      alert(error.message || 'Error saving news item');
    } finally {
      setNewsSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type} item?`)) return;

    try {
      const endpoint =
        type === 'gallery' ? api.endpoints.gallery : api.endpoints.events;
      await client(endpoint + `/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchData();
    } catch (error) {
      alert(error.message || 'Error deleting item');
    }
  };

  const startEdit = (item, type) => {
    if (type === 'gallery') {
      setGalleryForm({
        title: item.title || '',
        titleEn: item.titleEn || '',
        description: item.description || '',
        category: item.category || 'cleanliness',
        imageUrl: item.imageUrl || '',
        imageFile: null,
      });
      setEditingId(item._id);
    } else {
      setNewsForm({
        title: item.title || '',
        titleEn: item.titleEn || '',
        description: item.description || '',
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        location: item.location || '',
        imageUrl: item.imageUrl || '',
        imageFile: null,
      });
      setEditingId(item._id);
    }
    setShowAddForm(true);
  };

  const resetGalleryForm = () => {
    setGalleryForm({
      title: '',
      titleEn: '',
      description: '',
      category: 'cleanliness',
      imageUrl: '',
      imageFile: null,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  // Admin create-user is handled inside AdminCreateUser component; no parent reset required

  const resetNewsForm = () => {
    setNewsForm({
      title: '',
      titleEn: '',
      description: '',
      date: '',
      location: '',
      imageUrl: '',
      imageFile: null,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'gallery') {
      resetGalleryForm();
    } else if (tab === 'news') {
      resetNewsForm();
    }
  };

  // User management functions
  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
  };

  const handlePrintUser = (user) => {
    // open details modal and request auto-print
    setSelectedUser(user);
    setAutoPrint(true);
  };

  const handleUpdateMembershipStatus = async (userId, newStatus) => {
    try {
      await client(`${api.endpoints.auth}/users/${userId}/membership`, {
        method: 'PUT',
        body: { membershipStatus: newStatus },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Membership status updated successfully');
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      alert(error.message || 'Error updating membership status');
    }
  };

  const handleNotifyUser = async (userId, notificationData) => {
    try {
      await client(`${api.endpoints.auth}/users/${userId}/notify`, {
        method: 'POST',
        body: notificationData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Notification sent successfully');
    } catch (error) {
      alert(error.message || 'Error sending notification');
    }
  };

  const handleToggleAdmin = async (userId, makeAdmin) => {
    try {
      await client(`${api.endpoints.users}/${userId}/role`, {
        method: 'PUT',
        body: { role: makeAdmin ? 'admin' : 'user' },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert(`User role updated ${makeAdmin ? 'to admin' : 'to user'}`);
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      alert(error.message || 'Error updating user role');
    }
  };

  const handleToggleTeamLeader = async (userId, makeLeader) => {
    try {
      await client(`${api.endpoints.auth}/users/${userId}/team-leader`, {
        method: 'PUT',
        body: { isTeamLeader: !!makeLeader },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert(`User ${makeLeader ? 'marked as' : 'removed from'} team leader`);
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      alert(error.message || 'Error updating team leader status');
    }
  };

  const handleAssignPosition = async (userId, positionId) => {
    try {
      await client(`${api.endpoints.auth}/users/${userId}/position`, {
        method: 'PUT',
        body: { positionId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('User position updated');
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      alert(error.message || 'Error assigning position');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        'Are you sure you want to permanently delete this user? This action cannot be undone.',
      )
    )
      return;
    try {
      await client(`${api.endpoints.users}/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('User deleted successfully');
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      alert(error.message || 'Error deleting user');
    }
  };

  // Position management (create/delete)
  const [newPositionName, setNewPositionName] = useState('');
  const [newPositionDescription, setNewPositionDescription] = useState('');

  const handleCreatePosition = async (e) => {
    e.preventDefault();
    if (!newPositionName.trim()) return alert('Please provide a position name');
    try {
      await client(api.endpoints.positions, {
        method: 'POST',
        body: {
          name: newPositionName.trim(),
          description: newPositionDescription.trim(),
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNewPositionName('');
      setNewPositionDescription('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Error creating position');
    }
  };

  const handleDeletePosition = async (pos) => {
    if (!pos) return;
    if (pos.name && pos.name.toLowerCase() === 'member') {
      return alert('Default "Member" position cannot be deleted');
    }
    if (
      !confirm(
        `Delete position "${pos.name}"? This will remove the position from all users.`,
      )
    )
      return;
    try {
      await client(api.endpoints.positions + `/${pos._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchData();
    } catch (err) {
      alert(err.message || 'Error deleting position');
    }
  };

  // Prepare content area based on activeTab
  let content = null;
  if (loading) {
    content = <LoadingSpinner />;
  } else if (activeTab === 'gallery') {
    content = (
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {galleryItems.map((item) => (
          <GalleryCard
            key={item._id}
            item={item}
            onEdit={(item) => startEdit(item, 'gallery')}
            onDelete={(id) => handleDelete(id, 'gallery')}
          />
        ))}
      </div>
    );
  } else if (activeTab === 'news') {
    content = (
      <div className='space-y-4'>
        {newsItems.map((item) => (
          <NewsCard
            key={item._1d}
            item={item}
            onEdit={(item) => startEdit(item, 'news')}
            onDelete={(id) => handleDelete(id, 'news')}
          />
        ))}
      </div>
    );
  } else if (activeTab === 'positions') {
    content = (
      <div className='space-y-6'>
        <div className='bg-white p-6 rounded shadow'>
          <h2 className='text-xl font-semibold mb-4'>Create Position</h2>
          <form onSubmit={handleCreatePosition} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Position Name
              </label>
              <input
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                className='w-full px-3 py-2 border rounded'
                placeholder='e.g. President'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Description (optional)
              </label>
              <textarea
                value={newPositionDescription}
                onChange={(e) => setNewPositionDescription(e.target.value)}
                className='w-full px-3 py-2 border rounded'
                rows={3}
              />
            </div>
            <div className='flex gap-2'>
              <button
                className='bg-green-600 text-white px-4 py-2 rounded'
                type='submit'
              >
                Create
              </button>
              <button
                type='button'
                onClick={() => {
                  setNewPositionName('');
                  setNewPositionDescription('');
                }}
                className='bg-gray-200 px-4 py-2 rounded'
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className='bg-white p-6 rounded shadow'>
          <h2 className='text-xl font-semibold mb-4'>Existing Positions</h2>
          <div className='space-y-2'>
            {positions.length === 0 ? (
              <p className='text-sm text-gray-500'>No positions found.</p>
            ) : (
              positions.map((pos) => (
                <div
                  key={pos._id}
                  className='flex items-center justify-between p-3 border rounded'
                >
                  <div>
                    <div className='font-medium'>{pos.name}</div>
                    {pos.description && (
                      <div className='text-sm text-gray-500'>
                        {pos.description}
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeletePosition(pos)}
                      className='bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50'
                      disabled={pos.name && pos.name.toLowerCase() === 'member'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <>
        <div className='mb-4'>
          <div className='flex items-center gap-3'>
            <input
              type='text'
              placeholder='Search by User ID, Username, or Email...'
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
            <div className='flex gap-2'>
              <button
                onClick={() => handleExportUsers('csv')}
                disabled={loading}
                className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportUsers('xlsx')}
                disabled={loading}
                className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
              >
                Export Excel
              </button>
            </div>
          </div>

          {/* Filters row */}
          <div className='mt-3 bg-white p-4 rounded-lg shadow-sm'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>
                  Position
                </label>
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className='w-full px-3 py-2 border rounded bg-white'
                >
                  <option value=''>All</option>
                  {positions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>
                  Referred By (Team Leaders)
                </label>
                <select
                  value={filterReferredBy}
                  onChange={(e) => setFilterReferredBy(e.target.value)}
                  className='w-full px-3 py-2 border rounded bg-white'
                >
                  <option value=''>All</option>
                  {users
                    .filter((u) => !!u.isTeamLeader)
                    .map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.username || u.email}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>
                  Membership Type
                </label>
                <select
                  value={filterMembershipType}
                  onChange={(e) => setFilterMembershipType(e.target.value)}
                  className='w-full px-3 py-2 border rounded bg-white'
                >
                  <option value=''>All</option>
                  <option value='annual'>Annual</option>
                  <option value='ordinary'>Ordinary</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>
                  Membership Status
                </label>
                <select
                  value={filterMembershipStatus}
                  onChange={(e) => setFilterMembershipStatus(e.target.value)}
                  className='w-full px-3 py-2 border rounded bg-white'
                >
                  <option value=''>All</option>
                  <option value='active'>Active</option>
                  <option value='pending'>Pending</option>
                  <option value='cancelled'>Cancelled</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>
                  Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className='w-full px-3 py-2 border rounded bg-white'
                >
                  <option value=''>All</option>
                  <option value='admin'>Admin</option>
                  <option value='user'>User</option>
                </select>
              </div>

              <div className='flex items-end'>
                <div className='w-full'>
                  <button
                    onClick={() => {
                      setFilterPosition('');
                      setFilterReferredBy('');
                      setFilterMembershipType('');
                      setFilterMembershipStatus('');
                      setFilterRole('');
                    }}
                    className='w-full bg-gray-100 px-3 py-2 rounded text-sm'
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <UsersList
          users={filteredUsers}
          onViewDetails={handleViewUserDetails}
          onPrintID={handlePrintUser}
        />
      </>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <SEO
        title='Admin Dashboard'
        description='Administrator dashboard for managing gallery items, news articles, members, and positions.'
        canonical='/admin/dashboard'
        robots='noindex, nofollow'
      />
      <AdminHeader username={user?.username} onLogout={handleLogout} />

      <div className='container mx-auto px-4 py-8'>
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <FormModal
          show={showAddForm && activeTab !== 'users'}
          title={
            activeTab === 'gallery'
              ? `${editingId ? 'Edit' : 'Add New'} Gallery Item`
              : activeTab === 'news'
                ? `${editingId ? 'Edit' : 'Add New'} News Item`
                : activeTab === 'create-user'
                  ? 'Create User'
                  : ''
          }
          onClose={() => {
            if (activeTab === 'gallery') resetGalleryForm();
            else if (activeTab === 'news') resetNewsForm();
            else if (activeTab === 'create-user') setShowAddForm(false);
          }}
        >
          {activeTab === 'gallery' && (
            <GalleryForm
              formData={galleryForm}
              editingId={editingId}
              onSubmit={handleGallerySubmit}
              onChange={setGalleryForm}
              onCancel={resetGalleryForm}
              submitting={gallerySubmitting}
            />
          )}
          {activeTab === 'news' && (
            <NewsForm
              formData={newsForm}
              editingId={editingId}
              onSubmit={handleNewsSubmit}
              onChange={setNewsForm}
              onCancel={resetNewsForm}
              submitting={newsSubmitting}
            />
          )}
          {activeTab === 'create-user' && (
            <AdminCreateUser
              onCreated={() => {
                fetchData();
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </FormModal>

        {!showAddForm && activeTab !== 'users' && (
          <button
            onClick={() => {
              if (activeTab === 'gallery') resetGalleryForm();
              else if (activeTab === 'news') resetNewsForm();
              // create-user handled by AdminCreateUser component; just open modal
              setShowAddForm(true);
            }}
            className='mb-6 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium'
          >
            {activeTab === 'create-user'
              ? '+ Create User'
              : `+ Add New ${
                  activeTab === 'gallery' ? 'Gallery Item' : 'News Item'
                }`}
          </button>
        )}

        {content}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          autoPrint={autoPrint}
          onAutoPrinted={() => setAutoPrint(false)}
          onClose={() => {
            setSelectedUser(null);
            setAutoPrint(false);
          }}
          onUpdateStatus={handleUpdateMembershipStatus}
          onNotify={handleNotifyUser}
          onToggleAdmin={handleToggleAdmin}
          onDelete={handleDeleteUser}
          onToggleTeamLeader={handleToggleTeamLeader}
          positions={positions}
          onTogglePosition={handleAssignPosition}
          onUserUpdated={() => {
            fetchData();
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
