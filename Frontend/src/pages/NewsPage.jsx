import { useEffect } from 'react'
import { useEvents } from '../hooks/useEvents.js'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import SEO from '../components/SEO.jsx'
import { getImageUrl } from '../utils/imageUrl.js'

const NewsPage = () => {
  const { data, isLoading, error } = useEvents()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Fallback to placeholder events if API fails or no data
  const allNews = data?.data || [
    {
      _id: 1,
      title: 'फाल्गुन मेले का विशेष सफाई अभियान',
      titleEn: 'Special Cleanliness Drive at Falgun Fair',
      date: '2024-02-15',
      description: 'फाल्गुन मेले के दस दिवसीय विशेष सफाई अभियान का सफलतापूर्वक संचालन किया गया।',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    },
    {
      _id: 2,
      title: 'एकादशी सेवा कार्यक्रम',
      titleEn: 'Ekadashi Service Program',
      date: '2024-01-20',
      description: 'हर माह की एकादशी सेवा कार्यक्रम में 500+ स्वयंसेवकों ने भाग लिया।',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    },
    {
      _id: 3,
      title: 'वाटर कूलर स्थापना',
      titleEn: 'Water Cooler Installation',
      date: '2023-12-10',
      description: 'खाटूधाम के प्रमुख स्थानों पर नए वाटर कूलर स्थापित किए गए।',
      imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
    },
  ]

  return (
    <div className="min-h-screen">
      <SEO 
        title="News & Updates - ABSSD"
        description="अखिल भारतीय स्वच्छता सेवा दल की ताजी खबरें और अपडेट। स्वच्छता अभियान, जल सेवा कार्यक्रम, एकादशी सेवा और सामाजिक पहल की जानकारी।"
        canonical="/news"
        ogImage="https://abssd.in/images/logo.png"
      />
      <Header />
      <main className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              समाचार और अपडेट्स
            </h1>
            <p className="text-xl text-gray-600 mb-2">News & Updates</p>
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-8"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              हमारे कार्यक्रमों, अभियानों और गतिविधियों के बारे में नवीनतम समाचार
              <br />
              Latest news about our programs, campaigns and activities
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">लोड हो रहा है...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 text-red-600">
              <p>समाचार लोड करने में त्रुटि। कृपया बाद में पुनः प्रयास करें।</p>
            </div>
          )}

          {/* News Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {allNews.map((item) => (
                <article
                  key={item._id || item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getImageUrl(item.imageUrl || item.image) || '/images/news-thumbnail.png'}
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = '/images/news-thumbnail.png'
                      }}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      loading='lazy'
                    />
                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      समाचार / News
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(item.date).toLocaleDateString('hi-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{item.titleEn || item.en}</p>
                    <p className="text-gray-700 mb-4 line-clamp-3">{item.description}</p>
                    <a
                      href="#"
                      className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                    >
                      और पढ़ें
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!isLoading && !error && allNews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">कोई समाचार उपलब्ध नहीं है।</p>
              <p className="text-sm text-gray-500 mt-2">No news available.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default NewsPage

