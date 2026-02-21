import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { DarkModeProvider } from '../context/DarkModeContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  FiUserPlus,
  FiDownload,
  FiSearch,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';
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
import SkeletonLoader from '../components/admin/SkeletonLoader.jsx';
import UsersList from '../components/admin/UsersList.jsx';
import UserDetailsModal from '../components/admin/UserDetailsModal.jsx';
import SocialCardsList from '../components/admin/SocialCardsList.jsx';
import SocialCardImageModal from '../components/admin/SocialCardImageModal.jsx';
import SEO from '../components/SEO.jsx';

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryItems, setGalleryItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [socialCards, setSocialCards] = useState([]);
  const [socialCardStats, setSocialCardStats] = useState({});
  const [viewingSocialCard, setViewingSocialCard] = useState(null);
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
  const [filterCardIssued, setFilterCardIssued] = useState('');

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
      } else if (activeTab === 'users' || activeTab === 'positions') {
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
      } else if (activeTab === 'social-cards') {
        try {
          const response = await client('/social-cards', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!mountedRef.current) return;
          setSocialCards(response.data || []);

          // Fetch stats
          const statsResp = await client('/social-cards/stats', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!mountedRef.current) return;
          setSocialCardStats(statsResp.stats || {});
        } catch (err) {
          console.error('Error fetching social cards:', err);
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

  useEffect(() => {
    document.body.style.overflow = showAddForm ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddForm]);

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
          String(u.memberNumber || '')
            .toLowerCase()
            .includes(q) ||
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
      if (filterCardIssued) {
        const wantsIssued = filterCardIssued === 'yes';
        if (Boolean(u.cardIssued) !== wantsIssued) return false;
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
    filterCardIssued,
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
    setShowAddForm(false);
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

  const handleToggleCardIssued = async (userId, cardIssued) => {
    try {
      const response = await client(
        `${api.endpoints.auth}/users/${userId}/card-issued`,
        {
          method: 'PUT',
          body: { cardIssued },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      if (response.success) {
        // Update local state to reflect the change
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u._id === userId ? { ...u, cardIssued } : u)),
        );
      }
    } catch (error) {
      console.error('Error updating card issued status:', error);
      alert(error.message || 'Error updating card issued status');
    }
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

  // Social Cards handlers
  const handleDeleteSocialCard = async (id) => {
    if (
      !confirm('Are you sure you want to delete this social card submission?')
    )
      return;

    try {
      await client(`/social-cards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchData();
    } catch (error) {
      alert(error.message || 'Error deleting social card');
    }
  };

  const handleViewSocialCardImage = (card) => {
    setViewingSocialCard(card);
  };

  // Prepare content area based on activeTab
  let content = null;
  if (loading) {
    if (activeTab === 'gallery') {
      content = (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <SkeletonLoader type='card' count={6} />
        </div>
      );
    } else if (activeTab === 'news') {
      content = (
        <div className='space-y-4'>
          <SkeletonLoader type='list-item' count={3} />
        </div>
      );
    } else if (activeTab === 'users') {
      content = (
        <div className='mt-6 overflow-x-auto rounded-lg shadow-md'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  No.
                </th>
                <th className='px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  M.No.
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Contact
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Membership
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <SkeletonLoader type='table-row' count={5} />
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === 'positions') {
      content = (
        <div className='space-y-3'>
          <SkeletonLoader type='list-item' count={4} />
        </div>
      );
    }
  } else if (activeTab === 'gallery') {
    content = (
      <div>
        {galleryItems.length === 0 ? (
          <div className='text-center py-16 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg'>
            <span className='text-5xl'>🖼️</span>
            <p className='mt-3 text-gray-600 font-medium'>
              No gallery items yet. Create your first one!
            </p>
          </div>
        ) : (
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
        )}
      </div>
    );
  } else if (activeTab === 'news') {
    content = (
      <div>
        {newsItems.length === 0 ? (
          <div className='text-center py-16 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg'>
            <span className='text-5xl'>📰</span>
            <p className='mt-3 text-gray-600 font-medium'>
              No news items yet. Create your first one!
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {newsItems.map((item) => (
              <NewsCard
                key={item._id}
                item={item}
                onEdit={(item) => startEdit(item, 'news')}
                onDelete={(id) => handleDelete(id, 'news')}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else if (activeTab === 'positions') {
    content = (
      <div className='space-y-6'>
        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <h2 className='text-2xl font-bold mb-6 text-gray-900'>
            Create New Position
          </h2>
          <form onSubmit={handleCreatePosition} className='space-y-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Position Name
              </label>
              <input
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
                placeholder='e.g. President, Treasurer'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Description (optional)
              </label>
              <textarea
                value={newPositionDescription}
                onChange={(e) => setNewPositionDescription(e.target.value)}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
                rows={3}
                placeholder='Describe the role and responsibilities...'
              />
            </div>
            <div className='flex gap-2'>
              <button
                className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm transition-colors duration-200'
                type='submit'
              >
                <FiPlus size={16} />
                Create Position
              </button>
              <button
                type='button'
                onClick={() => {
                  setNewPositionName('');
                  setNewPositionDescription('');
                }}
                className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium text-sm transition-colors duration-200'
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <h2 className='text-2xl font-bold mb-6 text-gray-900'>
            Existing Positions
          </h2>
          <div className='space-y-3'>
            {positions.length === 0 ? (
              <p className='text-center py-8 text-gray-500'>
                No positions found.
              </p>
            ) : (
              positions.map((pos) => (
                <div
                  key={pos._id}
                  className='flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200'
                >
                  <div>
                    <div className='font-semibold text-gray-900 text-base'>
                      {pos.name}
                    </div>
                    {pos.description && (
                      <div className='text-sm text-gray-600 mt-1'>
                        {pos.description}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePosition(pos)}
                    className='flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={pos.name && pos.name.toLowerCase() === 'member'}
                    title={
                      pos.name && pos.name.toLowerCase() === 'member'
                        ? 'Default position cannot be deleted'
                        : 'Delete this position'
                    }
                  >
                    <FiTrash2 size={16} />
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  } else if (activeTab === 'social-cards') {
    content = (
      <SocialCardsList
        socialCards={socialCards}
        onDelete={handleDeleteSocialCard}
        onViewImage={handleViewSocialCardImage}
        stats={socialCardStats}
      />
    );
  } else if (activeTab === 'users') {
    content = (
      <>
        {/* Header Section */}
        <div className='mb-6'>
          <div className='flex flex-col gap-4'>
            {/* Primary Actions Row */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
              <button
                onClick={() => setShowAddForm(true)}
                className='flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium text-sm transition-colors duration-200 whitespace-nowrap'
              >
                <FiUserPlus size={18} />
                Create User
              </button>
              <div className='flex-1 relative'>
                <FiSearch
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                  size={18}
                />
                <input
                  type='text'
                  placeholder='Search by ID, username, or email...'
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm'
                />
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => handleExportUsers('csv')}
                  disabled={loading}
                  className='flex items-center justify-center gap-1.5 bg-green-600 text-white px-3.5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm transition-colors duration-200'
                >
                  <FiDownload size={16} />
                  CSV
                </button>
                <button
                  onClick={() => handleExportUsers('xlsx')}
                  disabled={loading}
                  className='flex items-center justify-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition-colors duration-200'
                >
                  <FiDownload size={16} />
                  Excel
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <div className='bg-white border border-gray-200 p-4 rounded-lg'>
              <p className='text-sm font-semibold text-gray-700 mb-4'>
                Filters
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-2'>
                    Position
                  </label>
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
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
                  <label className='block text-xs font-semibold text-gray-600 mb-2'>
                    Referred By
                  </label>
                  <select
                    value={filterReferredBy}
                    onChange={(e) => setFilterReferredBy(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
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
                  <label className='block text-xs font-semibold text-gray-600 mb-2'>
                    Membership Type
                  </label>
                  <select
                    value={filterMembershipType}
                    onChange={(e) => setFilterMembershipType(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
                  >
                    <option value=''>All</option>
                    <option value='annual'>Annual</option>
                    <option value='ordinary'>Ordinary</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-2'>
                    Membership Status
                  </label>
                  <select
                    value={filterMembershipStatus}
                    onChange={(e) => setFilterMembershipStatus(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
                  >
                    <option value=''>All</option>
                    <option value='active'>Active</option>
                    <option value='pending'>Pending</option>
                    <option value='cancelled'>Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-2'>
                    Role
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
                  >
                    <option value=''>All</option>
                    <option value='admin'>Admin</option>
                    <option value='user'>User</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-2'>
                    Card Issued
                  </label>
                  <select
                    value={filterCardIssued}
                    onChange={(e) => setFilterCardIssued(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
                  >
                    <option value=''>All</option>
                    <option value='yes'>Yes</option>
                    <option value='no'>No</option>
                  </select>
                </div>

                <div className='flex items-end'>
                  <button
                    onClick={() => {
                      setFilterPosition('');
                      setFilterReferredBy('');
                      setFilterMembershipType('');
                      setFilterMembershipStatus('');
                      setFilterRole('');
                      setFilterCardIssued('');
                    }}
                    className='w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm'
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className='mt-6 overflow-x-auto rounded-lg shadow-md'>
          <UsersList
            users={filteredUsers}
            onViewDetails={handleViewUserDetails}
            onPrintID={handlePrintUser}
            onToggleCardIssued={handleToggleCardIssued}
          />
        </div>
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

      <div className='container mx-auto px-4 py-6'>
        {/* Tab Navigation */}
        <div className='mb-6'>
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Main Content Container */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          {/* Content Padding */}
          <div className='p-6'>
            <FormModal
              show={showAddForm}
              title={
                activeTab === 'gallery'
                  ? `${editingId ? 'Edit' : 'Add'} Gallery Item`
                  : activeTab === 'news'
                    ? `${editingId ? 'Edit' : 'Add'} News Item`
                    : activeTab === 'users'
                      ? 'Create New User'
                      : ''
              }
              onClose={() => {
                if (activeTab === 'gallery') resetGalleryForm();
                else if (activeTab === 'news') resetNewsForm();
                else if (activeTab === 'users') setShowAddForm(false);
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
              {activeTab === 'users' && (
                <AdminCreateUser
                  onCreated={() => {
                    fetchData();
                    setShowAddForm(false);
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
            </FormModal>

            {!showAddForm &&
              (activeTab === 'gallery' || activeTab === 'news') && (
                <button
                  onClick={() => {
                    if (activeTab === 'gallery') resetGalleryForm();
                    else if (activeTab === 'news') resetNewsForm();
                    setShowAddForm(true);
                  }}
                  className='mb-6 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 font-medium text-sm transition-colors duration-200'
                >
                  {`+ Add New ${activeTab === 'gallery' ? 'Gallery Item' : 'News Item'}`}
                </button>
              )}

            {content}
          </div>
        </div>
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

      {/* Social Card Image Modal */}
      {viewingSocialCard && (
        <SocialCardImageModal
          card={viewingSocialCard}
          onClose={() => setViewingSocialCard(null)}
        />
      )}
    </div>
  );
};

// Wrap with DarkModeProvider
const AdminDashboardWithDarkMode = () => (
  <DarkModeProvider>
    <AdminDashboard />
  </DarkModeProvider>
);

export default AdminDashboardWithDarkMode;
