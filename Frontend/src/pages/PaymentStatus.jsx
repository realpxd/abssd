import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client.js';
import api from '../api/config.js';
import SEO from '../components/SEO.jsx';

const PaymentStatus = () => {
  const [search] = useSearchParams();
  const orderId = search.get('orderId');
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Checking payment status...');
  const [userInfo, setUserInfo] = useState(null);
  const [fallbackInfo, setFallbackInfo] = useState(null);

  const check = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await client(api.endpoints.payment + `/status/${orderId}`);
      const s = res.data.status || 'pending';
      setStatus(s);
      setMessage(`Payment status: ${s}`);
      if (res.data.user) setUserInfo(res.data.user);
      if (res.data.fallback) setFallbackInfo(res.data.fallback);
      // If captured or refunded, optionally navigate or show instructions
    } catch (err) {
      setMessage(err.message || 'Unable to fetch status');
    }
    setLoading(false);
  };

  useEffect(() => {
    check();
    const id = setInterval(check, 5000);
    return () => clearInterval(id);
  }, [orderId]);

  if (!orderId) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h3 className='text-xl font-semibold'>No order specified</h3>
          <p className='mt-2'>Please contact support if you were charged.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <SEO
        title='Payment Status - Check Membership'
        description='अपनी भुगतान और सदस्यता सक्रियण स्थिति जांचें।'
        canonical='/payment-status'
        robots='noindex, follow'
      />
      <div className='max-w-xl w-full bg-white p-6 rounded shadow text-center'>
        {status === 'captured' &&
        userInfo &&
        userInfo.membershipStatus === 'active' ? (
          <>
            <h2 className='text-2xl font-bold mb-4'>
              Payment successful — Membership activated
            </h2>
            <p className='mb-3'>
              Order ID: <strong>{orderId}</strong>
            </p>
            <p className='mb-4'>
              Your payment was captured and your membership is now active.
            </p>
            <div className='flex items-center justify-center gap-3'>
              <Link
                to='/profile'
                className='px-4 py-2 bg-green-600 text-white rounded'
              >
                Go to Profile
              </Link>
              <Link to='/' className='px-4 py-2 border rounded'>
                Return Home
              </Link>
            </div>
          </>
        ) : status === 'captured' &&
          (!userInfo || userInfo.membershipStatus !== 'active') ? (
          <>
            <h2 className='text-2xl font-bold mb-4'>Payment captured</h2>
            <p className='mb-3'>
              Order ID: <strong>{orderId}</strong>
            </p>
            <p className='mb-4'>
              We received the payment. We're finalizing your account — this may
              take a minute.
            </p>
            <div className='flex items-center justify-center gap-3'>
              <button
                onClick={check}
                disabled={loading}
                className='px-4 py-2 bg-orange-600 text-white rounded'
              >
                Re-check status
              </button>
              <Link to='/' className='px-4 py-2 border rounded'>
                Return Home
              </Link>
            </div>
          </>
        ) : status === 'failed' || status === 'refunded' ? (
          <>
            <h2 className='text-2xl font-bold mb-4'>Payment not completed</h2>
            <p className='mb-3'>
              Order ID: <strong>{orderId}</strong>
            </p>
            <p className='mb-4'>{message}</p>
            <div className='flex items-center justify-center gap-3'>
              <Link
                to='/donation'
                className='px-4 py-2 bg-orange-600 text-white rounded'
              >
                Try Payment Again
              </Link>
              <Link to='/' className='px-4 py-2 border rounded'>
                Return Home
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className='text-2xl font-bold mb-4'>
              Payment verification in progress
            </h2>
            <p className='mb-3'>
              Order ID: <strong>{orderId}</strong>
            </p>
            <p className='mb-4'>{message}</p>
            <div className='flex items-center justify-center gap-3'>
              <button
                onClick={check}
                disabled={loading}
                className='px-4 py-2 bg-orange-600 text-white rounded'
              >
                Check now
              </button>
              <Link to='/' className='px-4 py-2 border rounded'>
                Return Home
              </Link>
            </div>
            <p className='text-sm text-gray-500 mt-4'>
              If this remains pending for more than 15 minutes, we'll either
              finalize your registration or refund the payment and email you.
            </p>
          </>
        )}
        {/* Show detected user/contact info if available */}
        {(userInfo || fallbackInfo) && (
          <div className='mb-4 text-left bg-gray-100 p-3 rounded mt-6'>
            <h3 className='font-semibold mb-2'>Detected details</h3>
            <div className='text-sm text-gray-700 space-y-1'>
              {userInfo && (
                <div>
                  Name: <strong>{userInfo.username || '—'}</strong>
                </div>
              )}
              {userInfo && (
                <div>
                  Email: <strong>{userInfo.email || '—'}</strong>
                </div>
              )}
              {userInfo && (
                <div>
                  Phone: <strong>{userInfo.contactNo || '—'}</strong>
                </div>
              )}
              {!userInfo && fallbackInfo && fallbackInfo.name && (
                <div>
                  Name: <strong>{fallbackInfo.name}</strong>
                </div>
              )}
              {!userInfo && fallbackInfo && fallbackInfo.email && (
                <div>
                  Email: <strong>{fallbackInfo.email}</strong>
                </div>
              )}
              {!userInfo && fallbackInfo && fallbackInfo.contactNo && (
                <div>
                  Phone: <strong>{fallbackInfo.contactNo}</strong>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Contact support options when pending */}
        <div className='mt-4'>
          <h3 className='font-semibold mb-2'>Need help?</h3>
          <p className='text-sm text-gray-600 mb-2'>
            If this remains pending, contact support with your Order ID and any
            details below.
          </p>
          <div className='flex items-center justify-center gap-3'>
            <a
              href={`mailto:abssdtrust@gmail.com?subject=${encodeURIComponent('Payment issue - order ' + orderId)}&body=${encodeURIComponent('Order ID: ' + orderId + '\n\nPlease include your name, email and phone if not already provided.')}`}
              className='px-4 py-2 bg-blue-600 text-white rounded'
            >
              Email Support
            </a>
            <a
              href={`https://wa.me/918860442044?text=${encodeURIComponent('Hello, I paid for order ' + orderId + '. Please help check the status.')}`}
              target='_blank'
              rel='noreferrer'
              className='px-4 py-2 bg-green-600 text-white rounded'
            >
              Contact via WhatsApp
            </a>
          </div>
          <p className='text-xs text-gray-500 mt-3'>
            Support phone:{' '}
            <a className='text-gray-700 underline' href='tel:+918860442044'>
              +91 88604 42044
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
