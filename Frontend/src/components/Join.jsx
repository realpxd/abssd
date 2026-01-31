import { Link } from 'react-router-dom';
import { handleSmoothScroll } from '../utils/smoothScroll.js';
import { useAuth } from '../context/AuthContext.jsx';

const Join = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section
      id='join'
      className='py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white'
    >
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6'>हमसे जुड़ें</h2>
          <p className='text-xl mb-4'>Join Us</p>
          <p className='text-lg mb-8 text-orange-50 max-w-2xl mx-auto'>
            <span className='notranslate' translate='no'>
              अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट
            </span>{' '}
            से जुड़कर स्वच्छता अभियान में अपना योगदान दें। आज 500+ स्वयंसेवक इस
            पवित्र अभियान से जुड़े हैं।
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='tel:+918860442044'
              className='bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer'
            >
              📞 अभी कॉल करें / Call Now
            </a>
            {!isAuthenticated ? (
              <Link
                to='/register'
                className='bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer'
              >
                सदस्यता लें / Become Member
              </Link>
            ) : (
              <Link
                to='/profile'
                className='bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer'
              >
                मेरी प्रोफ़ाइल / My Profile
              </Link>
            )}
            <a
              href='#contact'
              onClick={(e) => handleSmoothScroll(e, '#contact', 80)}
              className='bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all cursor-pointer'
            >
              संपर्क फॉर्म / Contact Form
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Join;
