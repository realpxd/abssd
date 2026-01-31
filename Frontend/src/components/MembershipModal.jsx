import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MembershipModal = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Don't show modal if user is already logged in
    if (isLoggedIn) return;

    // Show modal after 2 seconds
    const showTimer = setTimeout(() => {
      setShowModal(true);
    }, 2000);

    return () => clearTimeout(showTimer);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!showModal) return;

    // Progress bar countdown: 10 seconds total
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          setShowModal(false);
          return 100;
        }
        return prev - 1; // 10 seconds = 100 intervals of 100ms, so 100/100 = 1 per interval
      });
    }, 100);

    return () => clearInterval(interval);
  }, [showModal]);

  const handleClose = () => {
    setShowModal(false);
    setProgress(100);
  };

  const handleSignup = () => {
    setShowModal(false);
    navigate('/register');
  };

  if (!showModal) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden'>
        {/* Progress Bar */}
        <div className='h-1 bg-gray-200'>
          <div
            className='h-full bg-orange-600 transition-all duration-100'
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Close Button */}
        <div className='absolute top-4 right-4'>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 text-2xl font-bold'
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className='p-8'>
          {/* Icon/Image */}
          <div className='text-center mb-6'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4'>
              <svg
                className='w-8 h-8 text-orange-600'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className='text-2xl font-bold text-gray-900 text-center mb-4 leading-snug'>
            <span className='block tracking-wide'>हमसे जुड़ें</span>
            <span className='block text-xl text-gray-800 font-semibold mt-1'>
              Join US
            </span>
          </h2>

          {/* Description */}
          <div className='text-center mb-8 space-y-3 leading-relaxed'>
            <p className='text-gray-700 text-base'>
              हमारे संगठन के सदस्य बनें और एक सार्थक पहल का हिस्सा बनें। हमारे
              मिशन में योगदान दें।
            </p>
            <p className='text-gray-600 text-sm'>
              Become a valued member of our organization and be part of
              something meaningful. Contribute to our mission.
            </p>
          </div>

          {/* Buttons */}
          <div className='space-y-4 mt-6'>
            <button
              onClick={handleSignup}
              className='w-full bg-orange-600 text-white font-semibold py-3 rounded-lg hover:bg-orange-700 transition-colors'
            >
              अभी सदस्य बनें / Sign Up Now
            </button>
            <button
              onClick={handleClose}
              className='w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors'
            >
              शायद बाद में / Maybe Later
            </button>
          </div>

          {/* Timer Info */}
          <p className='text-xs text-gray-500 text-center mt-5 leading-relaxed'>
            यह पॉपअप स्वतः {Math.ceil(progress / 10)} सेकंड में बंद हो जाएगा /
            This popup will close automatically in {Math.ceil(progress / 10)}{' '}
            seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;
