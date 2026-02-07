import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import client from '../api/client.js';
import api from '../api/config.js';
import {
  sanitizeText,
  validateEmail,
  validatePhone,
  sanitizeObject,
} from '../utils/security.js';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: '', // Honeypot field - should remain empty
  });

  const contactMutation = useMutation({
    mutationFn: (data) =>
      client(api.endpoints.contact, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      alert('Thank you! Your message has been sent successfully.');
      setFormData({ name: '', email: '', phone: '', message: '', website: '' });
    },
    onError: (error) => {
      const errorMessage =
        error?.message ||
        'Error sending message. Please try again or contact us directly.';
      alert(errorMessage);
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate honeypot field (should be empty)
    if (formData.website) {
      console.warn('Honeypot field filled - possible spam attempt');
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      alert('कृपया वैध ईमेल दर्ज करें / Please enter a valid email');
      return;
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      alert(
        'कृपया वैध संपर्क नंबर दर्ज करें / Please enter a valid phone number',
      );
      return;
    }

    // Sanitize and validate all form fields
    const sanitizedData = {
      name: sanitizeText(formData.name),
      email: emailValidation.sanitized,
      phone: phoneValidation.sanitized,
      message: sanitizeText(formData.message),
    };

    contactMutation.mutate(sanitizedData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only sanitize text fields (name, message)
    // Email and phone should not be sanitized, just trimmed
    let newValue = value;

    if (name === 'name' || name === 'message') {
      // Sanitize text fields to remove HTML
      newValue = sanitizeText(value);
    } else if (name !== 'website') {
      // For email and phone, just trim whitespace
      newValue = value.trim();
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  // Load Twitter widgets script once so anchor timeline renders
  const [youtubeLoaded, setYoutubeLoaded] = useState(false);
  const [twitterLoaded, setTwitterLoaded] = useState(false);
  const [facebookLoaded, setFacebookLoaded] = useState(false);

  useEffect(() => {
    let twitterScript = null;
    const loadTwitter = () => {
      if (window.twttr && window.twttr.widgets) {
        try {
          window.twttr.widgets.load(
            document.querySelector('.twitter-embed-container'),
          );
        } catch (e) {}
        setTwitterLoaded(true);
        return;
      }

      twitterScript = document.createElement('script');
      twitterScript.src = 'https://platform.twitter.com/widgets.js';
      twitterScript.async = true;
      twitterScript.charset = 'utf-8';
      twitterScript.onload = () => {
        try {
          window.twttr &&
            window.twttr.widgets &&
            window.twttr.widgets.load(
              document.querySelector('.twitter-embed-container'),
            );
          setTwitterLoaded(true);
        } catch (e) {
          setTwitterLoaded(false);
        }
      };
      document.body.appendChild(twitterScript);

      // fallback: if script doesn't load in 4s, consider it failed
      setTimeout(() => {
        if (!window.twttr || !window.twttr.widgets) setTwitterLoaded(false);
      }, 4000);
    };

    loadTwitter();

    return () => {
      try {
        if (twitterScript) document.body.removeChild(twitterScript);
      } catch (e) {}
    };
  }, []);

  return (
    <section id='contact' className='py-20 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-800 mb-4'>
            संपर्क करें
          </h2>
          <p className='text-xl text-gray-600 mb-2'>Contact Us</p>
          <div className='w-24 h-1 bg-orange-500 mx-auto'></div>
        </div>

        <div className='max-w-6xl mx-auto grid md:grid-cols-2 gap-12'>
          {/* Contact Info */}
          <div className='space-y-8'>
            <div>
              <h3 className='text-2xl font-bold text-gray-800 mb-6'>
                हमसे जुड़ें
              </h3>
              <p className='text-gray-700 mb-6'>
                <span className='notranslate' translate='no'>
                  अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट
                </span>{' '}
                से जुड़कर स्वच्छता अभियान में अपना योगदान दें।
              </p>
            </div>

            <div className='space-y-6'>
              <div className='flex items-start space-x-4'>
                <div className='bg-orange-100 rounded-full p-3'>
                  <svg
                    className='w-6 h-6 text-orange-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                </div>
                <div>
                  <h4 className='font-semibold text-gray-800 mb-1'>
                    फोन / Phone
                  </h4>
                  <a
                    href='tel:+918860442044'
                    className='text-orange-600 hover:text-orange-700 font-medium'
                  >
                    +91 8860442044
                  </a>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='bg-orange-100 rounded-full p-3'>
                  <svg
                    className='w-6 h-6 text-orange-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <div>
                  <h4 className='font-semibold text-gray-800 mb-1'>
                    संस्थापक / Founder
                  </h4>
                  <p className='text-gray-700 notranslate' translate='no'>
                    श्री जीतू माली
                  </p>
                  <p className='text-sm text-gray-600 mt-1'>
                    संस्थापक एवं राष्ट्रीय अध्यक्ष
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className='bg-gray-50 rounded-2xl p-8 shadow-lg'>
            <h3 className='text-2xl font-bold text-gray-800 mb-6'>
              संदेश भेजें / Send Message
            </h3>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  नाम / Name *
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all'
                  placeholder='Your Name'
                />
              </div>

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  ईमेल / Email *
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all'
                  placeholder='your.email@example.com'
                />
              </div>

              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  फोन / Phone *
                </label>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all'
                  placeholder='+91 1234567890'
                />
              </div>

              <div>
                <label
                  htmlFor='message'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  संदेश / Message *
                </label>
                <textarea
                  id='message'
                  name='message'
                  required
                  rows='5'
                  value={formData.message}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none'
                  placeholder='Your Message'
                ></textarea>
              </div>

              {/* Honeypot field - hidden from users, bots will fill it */}
              <input
                type='text'
                name='website'
                value={formData.website}
                onChange={handleChange}
                tabIndex='-1'
                autoComplete='off'
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                }}
                aria-hidden='true'
              />

              <button
                type='submit'
                disabled={contactMutation.isPending}
                className='w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {contactMutation.isPending
                  ? 'भेज रहे हैं...'
                  : 'संदेश भेजें / Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* Khatu map (between contact form and socials) */}
        <div className='max-w-8xl mx-auto mt-8'>
          <h3 className='text-2xl font-bold text-gray-800 mb-4'>
            खाटू स्थान / Khatu Map
          </h3>
          <div className='bg-white rounded-2xl shadow p-4 mb-6'>
            <div className='w-full h-[800px] rounded overflow-hidden'>
              <iframe
                title='Khatu Map'
                className='w-full h-full'
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6206.495552647221!2d75.40220776924092!3d27.364453634097163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396cedbb5645b19d%3A0xe27fa89540960859!2sKhatoo%2C%20Rajasthan%20332602%2C%20India!5e0!3m2!1sen!2sus!4v1767869862869!5m2!1sen!2sus'
                frameBorder='0'
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
        {/* Social embeds grid */}
        <div className='max-w-6xl mx-auto mt-4'>
          <h3 className='text-2xl font-bold text-gray-800 mb-6'>
            हमारा सोशल / Social
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* YouTube */}
            <div className='bg-white rounded-2xl shadow p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-semibold text-gray-800'>YouTube</h4>
                <a
                  href='https://youtube.com/@akhilbhartiyeswachhtasew-fu1kt?si=8NaCAc2BSFvUU9qH'
                  target='_blank'
                  rel='noreferrer'
                  className='text-sm text-orange-600'
                >
                  Open
                </a>
              </div>
              <div className='w-full h-[500px] bg-gray-100 rounded overflow-hidden relative'>
                <iframe
                  className='w-full h-full'
                  src={`https://www.youtube.com/embed/sOpFTK-QIzU?si=C7Rewd5H4Mja1-2d`}
                  title='YouTube - latest uploads'
                  frameBorder='0'
                  allowFullScreen
                  onLoad={() => setYoutubeLoaded(true)}
                ></iframe>
                {!youtubeLoaded && (
                  <div className='absolute inset-0 flex flex-col items-center justify-center bg-white/70 p-4'>
                    <p className='text-center text-sm text-gray-600 mb-3'>
                      This video/embed may be unavailable due to provider
                      restrictions.
                    </p>
                    <a
                      href='https://www.youtube.com/embed/sOpFTK-QIzU?si=C7Rewd5H4Mja1-2d'
                      target='_blank'
                      rel='noreferrer'
                      className='inline-block bg-orange-500 text-white px-4 py-2 rounded'
                    >
                      Open on YouTube
                    </a>
                  </div>
                )}
              </div>
              <p className='mt-2 text-xs text-gray-500'>
                If the embed doesn't load due to provider restrictions, click
                "Open" to view the channel.
              </p>
            </div>

            {/* Instagram */}
            <div className='bg-white rounded-2xl shadow p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-semibold text-gray-800'>Instagram</h4>
                <a
                  href='https://www.instagram.com/akhilbhartiyaswachhtasewadal?igsh=aGVpdHE4ZzN1ZjY3&utm_source=qr'
                  target='_blank'
                  rel='noreferrer'
                  className='text-sm text-orange-600'
                >
                  Open
                </a>
              </div>
              <div className='w-full h-[500px] bg-gray-100 rounded overflow-hidden flex items-center justify-center'>
                <iframe
                  src='https://www.instagram.com/akhilbhartiyaswachhtasewadal/embed'
                  title='Instagram'
                  className='w-full h-full'
                  frameBorder='0'
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* X / Twitter */}
            <div className='bg-white rounded-2xl shadow p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-semibold text-gray-800'>X / Twitter</h4>
                <a
                  href='https://twitter.com/abssdtrust'
                  target='_blank'
                  rel='noreferrer'
                  className='text-sm text-orange-600'
                >
                  Open
                </a>
              </div>
              <div className='w-full h-[500px] bg-gray-100 rounded overflow-hidden p-4 twitter-embed-container relative'>
                <div className='h-full'>
                  <a
                    className='twitter-timeline'
                    href='https://twitter.com/abssdtrust?ref_src=twsrc%5Etfw'
                  >
                    Tweets by abssdtrust
                  </a>
                </div>
                {!twitterLoaded && (
                  <div className='absolute inset-0 flex flex-col items-center justify-center bg-white/70 p-4'>
                    <p className='text-center text-sm text-gray-600 mb-3'>
                      Twitter timeline not available — it may be blocked or the
                      script failed to load.
                    </p>
                    <a
                      href='https://twitter.com/abssdtrust'
                      target='_blank'
                      rel='noreferrer'
                      className='inline-block bg-orange-500 text-white px-4 py-2 rounded'
                    >
                      Open on X
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Facebook */}
            <div className='bg-white rounded-2xl shadow p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-semibold text-gray-800'>Facebook</h4>
                <a
                  href='https://www.facebook.com/p/%E0%A4%85%E0%A4%96%E0%A4%BF%E0%A4%B2-%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4%E0%A5%80%E0%A4%AF%E0%A4%B8%E0%A5%8D%E0%A4%B5%E0%A4%9B%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%BE-%E0%A4%B8%E0%A5%87%E0%A4%B5%E0%A4%BE-%E0%A4%A6%E0%A4%B2-100064129565746/'
                  target='_blank'
                  rel='noreferrer'
                  className='text-sm text-orange-600'
                >
                  Open
                </a>
              </div>
              <div className='w-full h-[500px] bg-gray-100 rounded overflow-hidden'>
                <iframe
                  className='w-full h-full'
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent('https://www.facebook.com/p/%E0%A4%85%E0%A4%96%E0%A4%BF%E0%A4%B2-%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4%E0%A5%80%E0%A4%AF%E0%A4%B8%E0%A5%8D%E0%A4%B5%E0%A4%9B%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%BE-%E0%A4%B8%E0%A5%87%E0%A4%B5%E0%A4%BE-%E0%A4%A6%E0%A4%B2-100064129565746/')}&tabs=timeline&width=580&height=500`}
                  title='Facebook'
                  frameBorder='0'
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
