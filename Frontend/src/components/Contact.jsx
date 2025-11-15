import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import client from '../api/client.js'
import api from '../api/config.js'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const contactMutation = useMutation({
    mutationFn: (data) => client(api.endpoints.contact, {
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      alert('Thank you! Your message has been sent successfully.')
      setFormData({ name: '', email: '', phone: '', message: '' })
    },
    onError: (error) => {
      alert('Error sending message. Please try again or contact us directly.')
      console.error(error)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    contactMutation.mutate(formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            संपर्क करें
          </h2>
          <p className="text-xl text-gray-600 mb-2">Contact Us</p>
          <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                हमसे जुड़ें
              </h3>
              <p className="text-gray-700 mb-6">
                <span className="notranslate" translate="no">अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट</span> से जुड़कर स्वच्छता अभियान में अपना योगदान दें।
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">फोन / Phone</h4>
                  <a href="tel:+918860442044" className="text-orange-600 hover:text-orange-700 font-medium">
                    +91 8860442044
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">पता / Address</h4>
                  <p className="text-gray-700 notranslate" translate="no">
                    5/1, महालक्ष्मी गार्डन,<br />
                    राजेंद्र पार्क, गुरुग्राम – 122001
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">संस्थापक / Founder</h4>
                  <p className="text-gray-700 notranslate" translate="no">श्री जीतू माली</p>
                  <p className="text-sm text-gray-600 mt-1">संस्थापक एवं राष्ट्रीय अध्यक्ष</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              संदेश भेजें / Send Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  नाम / Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  ईमेल / Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  फोन / Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="+91 1234567890"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  संदेश / Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Your Message"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={contactMutation.isPending}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contactMutation.isPending ? 'भेज रहे हैं...' : 'संदेश भेजें / Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

