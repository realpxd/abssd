import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import client from '../api/client.js';
import api from '../api/config.js';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

const TestControls = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [isResultsExpanded, setIsResultsExpanded] = useState(false);
  const [testData, setTestData] = useState({
    email: 'test@example.com',
    password: 'test123456',
    username: 'testuser',
    contactNo: '1234567890',
    state: 'Rajasthan',
    city: 'Jaipur',
    orderId: '',
    userId: '',
    positionId: '',
  });

  // Test Backend Health
  const testBackendHealth = async () => {
    setLoading(true);
    try {
      const healthUrl = '/health';
      const response = await client(healthUrl);
      setResults((prev) => ({
        ...prev,
        health: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        health: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Test Database Connection
  const testDatabase = async () => {
    setLoading(true);
    try {
      const healthUrl = '/health';
      const response = await client(healthUrl);
      setResults((prev) => ({
        ...prev,
        database: {
          success: true,
          status: response.database || 'unknown',
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        database: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Test Auth APIs
  const testAuth = async (action) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'checkEmail':
          response = await client(api.endpoints.auth + '/check-email', {
            method: 'POST',
            body: { email: testData.email },
          });
          break;
        case 'checkContact':
          response = await client(api.endpoints.auth + '/check-contact', {
            method: 'POST',
            body: { contactNo: testData.contactNo },
          });
          break;
        case 'login':
          response = await client(api.endpoints.auth + '/login', {
            method: 'POST',
            body: { email: testData.email, password: testData.password },
          });
          break;
        case 'adminLogin':
          response = await client(api.endpoints.auth + '/admin/login', {
            method: 'POST',
            body: { email: testData.email, password: testData.password },
          });
          break;
        case 'register':
          response = await client(api.endpoints.auth + '/register', {
            method: 'POST',
            body: {
              username: testData.username,
              email: testData.email,
              contactNo: testData.contactNo,
              password: testData.password,
              confirmPassword: testData.password,
            },
          });
          break;
        case 'me':
          response = await client(api.endpoints.auth + '/me');
          break;
        case 'forgotPassword':
          response = await client(api.endpoints.auth + '/forgot-password', {
            method: 'POST',
            body: { email: testData.email },
          });
          break;
        case 'resetPassword': {
          const token = prompt('Enter reset token');
          response = await client(api.endpoints.auth + '/reset-password', {
            method: 'POST',
            body: { token, password: testData.password },
          });
          break;
        }
        case 'sendEmailVerification':
          response = await client(
            api.endpoints.auth + '/send-email-verification',
            { method: 'POST' },
          );
          break;
        case 'verifyEmail': {
          const token = prompt('Enter email verification token');
          response = await client(api.endpoints.auth + '/verify-email', {
            method: 'POST',
            body: { token },
          });
          break;
        }
        case 'updateProfile':
          response = await client(api.endpoints.auth + '/profile', {
            method: 'PUT',
            body: {
              username: `${testData.username}_updated`,
              contactNo: testData.contactNo,
            },
          });
          break;
        default:
          throw new Error('Unknown action');
      }
      setResults((prev) => ({
        ...prev,
        [`auth_${action}`]: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [`auth_${action}`]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Send a test email (admin only)
  const testSendEmail = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      alert('Please login as admin to send test emails');
      return;
    }

    setLoading(true);
    try {
      const response = await client(api.endpoints.auth + '/test-email', {
        method: 'POST',
        body: {
          to: testData.email,
          subject: 'Test Email from ABSSD',
          message: 'This is a test email sent from Test Controls.',
        },
      });
      setResults((prev) => ({
        ...prev,
        test_email: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
      alert(`Test email sent to ${testData.email}`);
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        test_email: {
          success: false,
          error: err.message,
          timestamp: new Date().toISOString(),
        },
      }));
      alert(`Failed to send test email: ${err.message}`);
    }
    setLoading(false);
  };

  // Test Gallery APIs
  const testGallery = async (action, id = null) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'get':
          response = await client(api.endpoints.gallery);
          break;
        case 'create':
          response = await client(api.endpoints.gallery, {
            method: 'POST',
            body: {
              title: 'Test Gallery Item',
              titleEn: 'Test Gallery Item',
              description: 'This is a test gallery item',
              category: 'cleanliness',
              imageUrl: 'https://via.placeholder.com/400x300',
            },
          });
          break;
        case 'update':
          if (!id) throw new Error('ID required for update');
          response = await client(api.endpoints.gallery + `/${id}`, {
            method: 'PUT',
            body: {
              title: 'Updated Test Gallery Item',
              description: 'Updated description',
            },
          });
          break;
        case 'delete':
          if (!id) throw new Error('ID required for delete');
          response = await client(api.endpoints.gallery + `/${id}`, {
            method: 'DELETE',
          });
          break;
        default:
          throw new Error('Unknown action');
      }
      setResults((prev) => ({
        ...prev,
        [`gallery_${action}`]: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [`gallery_${action}`]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Test Events/News APIs
  const testEvents = async (action, id = null) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'get':
          response = await client(api.endpoints.events);
          break;
        case 'create':
          response = await client(api.endpoints.events, {
            method: 'POST',
            body: {
              title: 'Test News Item',
              titleEn: 'Test News Item',
              description: 'This is a test news item',
              date: new Date().toISOString(),
              location: 'Test Location',
              imageUrl: 'https://via.placeholder.com/400x300',
            },
          });
          break;
        case 'update':
          if (!id) throw new Error('ID required for update');
          response = await client(api.endpoints.events + `/${id}`, {
            method: 'PUT',
            body: {
              title: 'Updated Test News Item',
              description: 'Updated description',
            },
          });
          break;
        case 'delete':
          if (!id) throw new Error('ID required for delete');
          response = await client(api.endpoints.events + `/${id}`, {
            method: 'DELETE',
          });
          break;
        default:
          throw new Error('Unknown action');
      }
      setResults((prev) => ({
        ...prev,
        [`events_${action}`]: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [`events_${action}`]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Test Contact API
  const testContact = async (action) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'create':
          response = await client(api.endpoints.contact, {
            method: 'POST',
            body: {
              name: 'Test User',
              email: testData.email,
              phone: testData.contactNo,
              message: 'This is a test contact message',
            },
          });
          break;
        case 'get':
          response = await client(api.endpoints.contact);
          break;
        case 'getById': {
          const id = prompt('Enter Contact ID');
          response = await client(api.endpoints.contact + `/${id}`);
          break;
        }
        default:
          throw new Error('Unknown action');
      }
      setResults((prev) => ({
        ...prev,
        [`contact_${action}`]: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [`contact_${action}`]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Test Payment API
  const testPayment = async (action) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'createOrder':
          response = await client(api.endpoints.payment + '/create-order', {
            method: 'POST',
            body: {
              amount: 500,
              membershipType: 'annual',
            },
          });
          break;
        case 'openAnnualModal':
          response = await client(api.endpoints.payment + '/create-order', {
            method: 'POST',
            body: {
              amount: 2555,
              membershipType: 'annual',
              name: testData.username,
              email: testData.email,
              contactNo: testData.contactNo,
            },
          });

          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () =>
              reject(new Error('Razorpay SDK failed to load'));
            document.body.appendChild(script);
          });

          if (!window.Razorpay) {
            throw new Error('Razorpay SDK not available');
          }

          const options = {
            key: response.data.key,
            amount: response.data.amount,
            currency: response.data.currency,
            name: 'ABSSD Trust',
            description: 'Annual Membership',
            order_id: response.data.orderId,
            handler: (paymentResponse) => {
              setResults((prev) => ({
                ...prev,
                payment_modal: {
                  success: true,
                  data: paymentResponse,
                  timestamp: new Date().toISOString(),
                },
              }));
            },
            modal: {
              ondismiss: () => {
                setResults((prev) => ({
                  ...prev,
                  payment_modal: {
                    success: false,
                    error: 'Payment modal closed',
                    timestamp: new Date().toISOString(),
                  },
                }));
              },
            },
            prefill: {
              name: testData.username,
              email: testData.email,
              contact: testData.contactNo,
            },
            theme: { color: '#F97316' },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
          break;
        case 'status': {
          const orderId = testData.orderId || prompt('Enter Order ID');
          response = await client(api.endpoints.payment + `/status/${orderId}`);
          break;
        }
        default:
          throw new Error('Unknown action');
      }
      setResults((prev) => ({
        ...prev,
        [`payment_${action}`]: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [`payment_${action}`]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Test Geo APIs
  const testGeo = async (action) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'states':
          response = await client(api.endpoints.geo + '/states');
          break;
        case 'cities': {
          const state = testData.state || prompt('Enter state');
          response = await client(api.endpoints.geo + `/cities/${state}`);
          break;
        }
        default:
          throw new Error('Unknown action');
      }
      setResults((prev) => ({
        ...prev,
        [`geo_${action}`]: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [`geo_${action}`]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Test Positions APIs
  const testPositions = async (action) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'get':
          response = await client(api.endpoints.positions);
          break;
        case 'create':
          response = await client(api.endpoints.positions, {
            method: 'POST',
            body: { name: 'Test Position', description: 'Test position' },
          });
          break;
        case 'update': {
          const id = testData.positionId || prompt('Enter Position ID');
          response = await client(api.endpoints.positions + `/${id}`, {
            method: 'PUT',
            body: { name: 'Updated Position', description: 'Updated' },
          });
          break;
        }
        case 'delete': {
          const id = testData.positionId || prompt('Enter Position ID');
          response = await client(api.endpoints.positions + `/${id}`, {
            method: 'DELETE',
          });
          break;
        }
        default:
          throw new Error('Unknown action');
      }
      setResults((prev) => ({
        ...prev,
        [`positions_${action}`]: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [`positions_${action}`]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Test Admin User Management APIs
  const testAdminUsers = async (action) => {
    if (!isAuthenticated || user?.role !== 'admin') {
      alert('Please login as admin to use this section');
      return;
    }

    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'list':
          response = await client(api.endpoints.users);
          break;
        case 'get': {
          const id = testData.userId || prompt('Enter User ID');
          response = await client(api.endpoints.users + `/${id}`);
          break;
        }
        case 'updateRole': {
          const id = testData.userId || prompt('Enter User ID');
          const role = prompt('Enter role (admin/user)', 'user');
          response = await client(api.endpoints.users + `/${id}/role`, {
            method: 'PUT',
            body: { role },
          });
          break;
        }
        case 'updateMembership': {
          const id = testData.userId || prompt('Enter User ID');
          const status = prompt(
            'Enter membership status (pending/active/expired/cancelled)',
            'active',
          );
          response = await client(api.endpoints.users + `/${id}/membership`, {
            method: 'PUT',
            body: { membershipStatus: status },
          });
          break;
        }
        case 'updateMemberNumber': {
          const id = testData.userId || prompt('Enter User ID');
          const memberNumber = prompt('Enter member number');
          response = await client(
            api.endpoints.users + `/${id}/member-number`,
            { method: 'PUT', body: { memberNumber } },
          );
          break;
        }
        case 'updatePosition': {
          const id = testData.userId || prompt('Enter User ID');
          const positionId = testData.positionId || prompt('Enter Position ID');
          response = await client(api.endpoints.users + `/${id}/position`, {
            method: 'PUT',
            body: { positionId },
          });
          break;
        }
        case 'updateTeamLeader': {
          const id = testData.userId || prompt('Enter User ID');
          const isTeamLeader =
            prompt('Set team leader? (true/false)', 'false') === 'true';
          response = await client(api.endpoints.users + `/${id}/team-leader`, {
            method: 'PUT',
            body: { isTeamLeader },
          });
          break;
        }
        case 'notify': {
          const id = testData.userId || prompt('Enter User ID');
          response = await client(api.endpoints.users + `/${id}/notify`, {
            method: 'POST',
            body: {
              subject: 'Test Notification',
              message: 'This is a test notification from Test Controls.',
            },
          });
          break;
        }
        case 'delete': {
          const id = testData.userId || prompt('Enter User ID');
          response = await client(api.endpoints.users + `/${id}`, {
            method: 'DELETE',
          });
          break;
        }
        default:
          throw new Error('Unknown action');
      }

      setResults((prev) => ({
        ...prev,
        [`admin_${action}`]: {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [`admin_${action}`]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    setLoading(false);
  };

  // Run All Tests
  const runAllTests = async () => {
    setLoading(true);
    setResults({});

    // Sequential tests
    await testBackendHealth();
    await testDatabase();
    await testAuth('checkEmail');
    await testGeo('states');
    await testGallery('get');
    await testEvents('get');
    await testContact('create');
    await testPositions('get');

    setLoading(false);
  };

  // Clear Results
  const clearResults = () => {
    setResults({});
  };

  // Set User Role
  const setUserRole = async (role) => {
    if (!isAuthenticated) {
      alert('Please login first to set role');
      return;
    }

    if (!confirm(`Are you sure you want to set your role to "${role}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await client(api.endpoints.auth + '/profile', {
        method: 'PUT',
        body: { role },
      });

      setResults((prev) => ({
        ...prev,
        setRole: {
          success: true,
          data: { message: `Role updated to ${role}`, user: response.data },
          timestamp: new Date().toISOString(),
        },
      }));

      // Update user context immediately
      updateUser(response.data);

      // Show success message
      alert(
        `Role successfully updated to ${role}. Please refresh the page to see changes.`,
      );
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        setRole: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
      alert(`Error updating role: ${error.message}`);
    }
    setLoading(false);
  };

  // Backfill memberNumber sequentially by createdAt
  const backfillMemberNumbers = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      alert('Please login as admin to run this operation');
      return;
    }

    if (
      !confirm(
        'This will assign sequential member numbers to ALL users based on creation date (oldest -> newest). Proceed?',
      )
    )
      return;

    setLoading(true);
    setResults((prev) => ({
      ...prev,
      backfill: { running: true, progress: 0 },
    }));

    try {
      const res = await client(api.endpoints.users);
      const users = res.data || [];
      // Sort by createdAt ascending
      users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      const total = users.length;
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        const memberNumber = i + 1;
        try {
          await client(`${api.endpoints.users}/${u._id}/member-number`, {
            method: 'PUT',
            body: { memberNumber },
          });
          successCount++;
        } catch (err) {
          // Log individual failures but continue
          failCount++;
          setResults((prev) => ({
            ...prev,
            [`backfill_error_${u._id}`]: {
              success: false,
              error: err.message || String(err),
              user: u,
              attempted: memberNumber,
            },
          }));
        }

        // update progress
        setResults((prev) => ({
          ...prev,
          backfill: {
            running: true,
            progress: Math.round(((i + 1) / total) * 100),
            successCount,
            failCount,
            total,
          },
        }));
      }

      setResults((prev) => ({
        ...prev,
        backfill: {
          running: false,
          progress: 100,
          successCount,
          failCount,
          total,
        },
      }));
      alert(
        `Backfill completed. Success: ${successCount}, Failed: ${failCount}`,
      );
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        backfill: { running: false, error: error.message },
      }));
      alert(`Backfill failed: ${error.message}`);
    }

    setLoading(false);
  };

  // Backfill: set position of all users to 'Member'
  const backfillPositionsToMember = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      alert('Please login as admin to run this operation');
      return;
    }

    if (
      !confirm('This will set the position of ALL users to "Member". Proceed?')
    )
      return;

    setLoading(true);
    setResults((prev) => ({
      ...prev,
      backfill_positions: { running: true, progress: 0 },
    }));

    try {
      // Fetch positions to find 'Member'
      let positionsRes = await client(api.endpoints.positions);
      let positions = positionsRes.data || [];

      let memberPosition = positions.find(
        (p) => (p.name || '').toLowerCase() === 'member',
      );

      // If not found, create the Member position (requires admin token)
      if (!memberPosition) {
        const createRes = await client(api.endpoints.positions, {
          method: 'POST',
          body: { name: 'Member', description: 'Default member position' },
        });
        memberPosition = createRes.data;
      }

      if (!memberPosition || !memberPosition._id)
        throw new Error('Failed to resolve or create Member position');

      const memberPositionId = memberPosition._id;

      // Fetch all users
      const res = await client(api.endpoints.users);
      const users = res.data || [];
      const total = users.length;
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        try {
          await client(`${api.endpoints.users}/${u._id}/position`, {
            method: 'PUT',
            body: { positionId: memberPositionId },
          });
          successCount++;
        } catch (err) {
          failCount++;
          setResults((prev) => ({
            ...prev,
            [`backfill_positions_error_${u._id}`]: {
              success: false,
              error: err.message || String(err),
              user: u,
            },
          }));
        }

        setResults((prev) => ({
          ...prev,
          backfill_positions: {
            running: true,
            progress: Math.round(((i + 1) / total) * 100),
            successCount,
            failCount,
            total,
          },
        }));
      }

      setResults((prev) => ({
        ...prev,
        backfill_positions: {
          running: false,
          progress: 100,
          successCount,
          failCount,
          total,
        },
      }));
      alert(
        `Positions backfill completed. Success: ${successCount}, Failed: ${failCount}`,
      );
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        backfill_positions: { running: false, error: error.message },
      }));
      alert(`Positions backfill failed: ${error.message}`);
    }

    setLoading(false);
  };

  // Auto-expand results when new results are added
  useEffect(() => {
    if (Object.keys(results).length > 0) {
      setIsResultsExpanded(true);
    }
  }, [results]);

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div
        className={`max-w-7xl mx-auto p-8 transition-all duration-300 ${
          Object.keys(results).length > 0 && isResultsExpanded
            ? 'pb-[calc(60vh+2rem)]'
            : Object.keys(results).length > 0
              ? 'pb-24'
              : 'pb-8'
        }`}
      >
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2'>🔧 Test Controls Panel</h1>
          <p className='text-gray-400'>
            Comprehensive testing interface for backend, database, and API
            endpoints
          </p>
          <div className='mt-4 p-4 bg-gray-800 rounded-lg'>
            <p className='text-sm'>
              <strong>Current User:</strong>{' '}
              {isAuthenticated
                ? user?.email || user?.username
                : 'Not authenticated'}
            </p>
            <p className='text-sm'>
              <strong>API Base URL:</strong> {api.baseURL}
            </p>
          </div>
        </div>

        {/* Test Data Input */}
        <div className='mb-8 p-6 bg-gray-800 rounded-lg'>
          <h2 className='text-2xl font-bold mb-4'>Test Data</h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Email</label>
              <input
                type='email'
                value={testData.email}
                onChange={(e) =>
                  setTestData({ ...testData, email: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Backfill Member Numbers
              </label>
              <div className='flex gap-2'>
                <button
                  onClick={backfillMemberNumbers}
                  disabled={loading}
                  className='bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50'
                >
                  Run Backfill
                </button>
                <button
                  onClick={backfillPositionsToMember}
                  disabled={loading}
                  className='bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50'
                >
                  Set All Positions to Member
                </button>
                <button
                  onClick={() => {
                    setResults((prev) => ({ ...prev, backfill: undefined }));
                  }}
                  className='bg-gray-700 px-3 py-2 rounded hover:bg-gray-600'
                >
                  Clear
                </button>
              </div>
              <p className='text-xs text-gray-400 mt-2'>
                Assigns sequential member numbers to users by registration date
                (oldest=1).
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Password</label>
              <input
                type='password'
                value={testData.password}
                onChange={(e) =>
                  setTestData({ ...testData, password: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Username</label>
              <input
                type='text'
                value={testData.username}
                onChange={(e) =>
                  setTestData({ ...testData, username: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Contact No
              </label>
              <input
                type='text'
                value={testData.contactNo}
                onChange={(e) =>
                  setTestData({ ...testData, contactNo: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>State</label>
              <input
                type='text'
                value={testData.state}
                onChange={(e) =>
                  setTestData({ ...testData, state: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>City</label>
              <input
                type='text'
                value={testData.city}
                onChange={(e) =>
                  setTestData({ ...testData, city: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Order ID</label>
              <input
                type='text'
                value={testData.orderId}
                onChange={(e) =>
                  setTestData({ ...testData, orderId: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>User ID</label>
              <input
                type='text'
                value={testData.userId}
                onChange={(e) =>
                  setTestData({ ...testData, userId: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Position ID
              </label>
              <input
                type='text'
                value={testData.positionId}
                onChange={(e) =>
                  setTestData({ ...testData, positionId: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mb-8 flex gap-4 flex-wrap'>
          <button
            onClick={runAllTests}
            disabled={loading}
            className='bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold disabled:opacity-50'
          >
            {loading ? 'Running...' : '▶️ Run All Tests'}
          </button>
          <button
            onClick={clearResults}
            className='bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-bold'
          >
            🗑️ Clear Results
          </button>
        </div>

        {/* Test Sections */}
        <div className='grid md:grid-cols-2 gap-6'>
          {/* Backend & Database */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Backend & Database</h2>
            <div className='space-y-3'>
              <button
                onClick={testBackendHealth}
                disabled={loading}
                className='w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Test Backend Health
              </button>
              <button
                onClick={testDatabase}
                disabled={loading}
                className='w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Test Database Connection
              </button>
            </div>
          </div>

          {/* Auth APIs */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Auth APIs</h2>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => testAuth('checkEmail')}
                disabled={loading}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Check Email
              </button>
              <button
                onClick={() => testAuth('checkContact')}
                disabled={loading}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Check Contact
              </button>
              <button
                onClick={() => testAuth('login')}
                disabled={loading}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Login
              </button>
              <button
                onClick={() => testAuth('register')}
                disabled={loading}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Register
              </button>
              <button
                onClick={() => testAuth('adminLogin')}
                disabled={loading}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Admin Login
              </button>
              <button
                onClick={() => testAuth('forgotPassword')}
                disabled={loading}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Forgot Password
              </button>
              <button
                onClick={() => testAuth('resetPassword')}
                disabled={loading}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Reset Password
              </button>
              <button
                onClick={() => testAuth('sendEmailVerification')}
                disabled={loading || !isAuthenticated}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Send Email Verification
              </button>
              <button
                onClick={() => testAuth('verifyEmail')}
                disabled={loading}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Verify Email
              </button>
              <button
                onClick={() => testAuth('updateProfile')}
                disabled={loading || !isAuthenticated}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Update Profile
              </button>
              <button
                onClick={() => testAuth('me')}
                disabled={loading || !isAuthenticated}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Get Me
              </button>
              <button
                onClick={testSendEmail}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Send Test Email
              </button>
            </div>
          </div>

          {/* Gallery APIs */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Gallery APIs</h2>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => testGallery('get')}
                disabled={loading}
                className='bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Get All
              </button>
              <button
                onClick={() => testGallery('create')}
                disabled={loading || !isAuthenticated}
                className='bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Create
              </button>
              <button
                onClick={() => {
                  const id = prompt('Enter Gallery Item ID to update:');
                  if (id) testGallery('update', id);
                }}
                disabled={loading || !isAuthenticated}
                className='bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Update
              </button>
              <button
                onClick={() => {
                  const id = prompt('Enter Gallery Item ID to delete:');
                  if (id) testGallery('delete', id);
                }}
                disabled={loading || !isAuthenticated}
                className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Delete
              </button>
            </div>
          </div>

          {/* Events/News APIs */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Events/News APIs</h2>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => testEvents('get')}
                disabled={loading}
                className='bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Get All
              </button>
              <button
                onClick={() => testEvents('create')}
                disabled={loading || !isAuthenticated}
                className='bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Create
              </button>
              <button
                onClick={() => {
                  const id = prompt('Enter Event ID to update:');
                  if (id) testEvents('update', id);
                }}
                disabled={loading || !isAuthenticated}
                className='bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Update
              </button>
              <button
                onClick={() => {
                  const id = prompt('Enter Event ID to delete:');
                  if (id) testEvents('delete', id);
                }}
                disabled={loading || !isAuthenticated}
                className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Delete
              </button>
            </div>
          </div>

          {/* Contact API */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Contact API</h2>
            <div className='space-y-2'>
              <button
                onClick={() => testContact('create')}
                disabled={loading}
                className='w-full bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Create Contact
              </button>
              <button
                onClick={() => testContact('getById')}
                disabled={loading}
                className='w-full bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Get Contact By ID
              </button>
              <button
                onClick={() => testContact('get')}
                disabled={loading || !isAuthenticated}
                className='w-full bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Get All Contacts
              </button>
            </div>
          </div>

          {/* Geo APIs */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Geo APIs</h2>
            <div className='space-y-2'>
              <button
                onClick={() => testGeo('states')}
                disabled={loading}
                className='w-full bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Get States
              </button>
              <button
                onClick={() => testGeo('cities')}
                disabled={loading}
                className='w-full bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Get Cities by State
              </button>
            </div>
          </div>

          {/* Positions APIs */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Positions APIs</h2>
            <div className='space-y-2'>
              <button
                onClick={() => testPositions('get')}
                disabled={loading}
                className='w-full bg-lime-600 hover:bg-lime-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Get Positions
              </button>
              <button
                onClick={() => testPositions('create')}
                disabled={loading || !isAuthenticated}
                className='w-full bg-lime-600 hover:bg-lime-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Create Position
              </button>
              <button
                onClick={() => testPositions('update')}
                disabled={loading || !isAuthenticated}
                className='w-full bg-lime-600 hover:bg-lime-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Update Position
              </button>
              <button
                onClick={() => testPositions('delete')}
                disabled={loading || !isAuthenticated}
                className='w-full bg-lime-600 hover:bg-lime-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Delete Position
              </button>
            </div>
          </div>

          {/* Payment API */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Payment API</h2>
            <div className='space-y-2'>
              <button
                onClick={() => testPayment('createOrder')}
                disabled={loading}
                className='w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Create Order
              </button>
              <button
                onClick={() => testPayment('openAnnualModal')}
                disabled={loading}
                className='w-full bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Open Annual Membership Payment Modal
              </button>
              <button
                onClick={() => testPayment('status')}
                disabled={loading}
                className='w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Check Payment Status
              </button>
            </div>
          </div>

          {/* Admin User Management */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Admin User APIs</h2>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => testAdminUsers('list')}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                List Users
              </button>
              <button
                onClick={() => testAdminUsers('get')}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Get User
              </button>
              <button
                onClick={() => testAdminUsers('updateRole')}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Update Role
              </button>
              <button
                onClick={() => testAdminUsers('updateMembership')}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Update Membership
              </button>
              <button
                onClick={() => testAdminUsers('updateMemberNumber')}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Update Member #
              </button>
              <button
                onClick={() => testAdminUsers('updatePosition')}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Update Position
              </button>
              <button
                onClick={() => testAdminUsers('updateTeamLeader')}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Set Team Leader
              </button>
              <button
                onClick={() => testAdminUsers('notify')}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Notify User
              </button>
              <button
                onClick={() => testAdminUsers('delete')}
                disabled={loading || !isAuthenticated || user?.role !== 'admin'}
                className='bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm disabled:opacity-50'
              >
                Delete User
              </button>
            </div>
          </div>

          {/* User Role Management */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>User Role Management</h2>
            <div className='space-y-3'>
              <div className='p-3 bg-gray-700 rounded'>
                <p className='text-sm text-gray-300 mb-2'>
                  <strong>Current User:</strong>{' '}
                  {isAuthenticated
                    ? user?.email || user?.username
                    : 'Not authenticated'}
                </p>
                <p className='text-sm text-gray-300'>
                  <strong>Current Role:</strong>{' '}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user?.role === 'admin'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 text-gray-200'
                    }`}
                  >
                    {user?.role || 'user'}
                  </span>
                </p>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  onClick={() => setUserRole('admin')}
                  disabled={loading || !isAuthenticated}
                  className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm disabled:opacity-50 font-medium'
                >
                  Set as Admin
                </button>
                <button
                  onClick={() => setUserRole('user')}
                  disabled={loading || !isAuthenticated}
                  className='bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm disabled:opacity-50 font-medium'
                >
                  Set as User
                </button>
              </div>
              <p className='text-xs text-gray-400 mt-2'>
                ⚠️ This will update the role of the currently logged-in user.
                Page will reload after update.
              </p>
            </div>
          </div>
        </div>

        {/* Results Display - Fixed at Bottom */}
        {Object.keys(results).length > 0 && (
          <div
            className={`fixed bottom-0 left-0 right-0 bg-gray-800 border-t-2 border-gray-700 shadow-2xl transition-all duration-300 z-40 ${
              isResultsExpanded ? 'h-[60vh]' : 'h-16'
            }`}
          >
            {/* Header with Toggle */}
            <div className='flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700'>
              <div className='flex items-center gap-4'>
                <h2 className='text-xl font-bold'>Test Results</h2>
                <span className='text-sm text-gray-400'>
                  ({Object.keys(results).length}{' '}
                  {Object.keys(results).length === 1 ? 'test' : 'tests'})
                </span>
                <div className='flex gap-2'>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      Object.values(results).filter((r) => r.success).length ===
                      Object.keys(results).length
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                    }`}
                  >
                    {Object.values(results).filter((r) => r.success).length}/
                    {Object.keys(results).length} Passed
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={clearResults}
                  className='bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-medium transition-colors'
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsResultsExpanded(!isResultsExpanded)}
                  className='bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors'
                  aria-label={isResultsExpanded ? 'Collapse' : 'Expand'}
                >
                  {isResultsExpanded ? (
                    <FaChevronDown className='w-5 h-5' />
                  ) : (
                    <FaChevronUp className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Results Content */}
            {isResultsExpanded && (
              <div className='h-[calc(60vh-4rem)] overflow-y-auto p-4'>
                <div className='space-y-4'>
                  {Object.entries(results)
                    .sort(([, a], [, b]) => {
                      // Sort by timestamp descending (newest first)
                      return new Date(b.timestamp) - new Date(a.timestamp);
                    })
                    .map(([key, result]) => (
                      <div
                        key={key}
                        className={`p-4 rounded-lg ${
                          result.success
                            ? 'bg-green-900/50 border border-green-700'
                            : 'bg-red-900/50 border border-red-700'
                        }`}
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='font-bold text-sm'>
                            {key.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              result.success
                                ? 'bg-green-800 text-green-300'
                                : 'bg-red-800 text-red-300'
                            }`}
                          >
                            {result.success ? '✓ SUCCESS' : '✗ FAILED'}
                          </span>
                        </div>
                        <p className='text-xs text-gray-400 mb-2'>
                          Time: {new Date(result.timestamp).toLocaleString()}
                        </p>
                        {result.success ? (
                          <pre className='text-xs bg-gray-900 p-3 rounded overflow-x-auto max-h-48'>
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        ) : (
                          <p className='text-red-400 text-sm'>{result.error}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div
            className={`fixed right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 ${
              Object.keys(results).length > 0 && isResultsExpanded
                ? 'bottom-[calc(60vh+1rem)]'
                : 'bottom-4'
            }`}
          >
            <div className='flex items-center gap-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              <span>Running tests...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestControls;
