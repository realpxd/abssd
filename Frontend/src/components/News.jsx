import { Link } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents.js'
import { getImageUrl } from '../utils/imageUrl.js'

const News = () => {
  const { data, isLoading, error } = useEvents()

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

  // Show only first 3 news items on homepage
  const newsItems = allNews.slice(0, 3)

  return (
    <section id="news" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            समाचार और अपडेट्स
          </h2>
          <p className="text-xl text-gray-600 mb-2">News & Updates</p>
          <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">लोड हो रहा है...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-600">
            <p>समाचार लोड करने में त्रुटि। कृपया बाद में पुनः प्रयास करें।</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
              {newsItems.map((item) => (
                <article
                  key={item._id || item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageUrl(item.imageUrl || item.image) || '/images/news-thumbnail.png'}
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = '/images/news-thumbnail.png'
                      }}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      loading='lazy'
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(item.date).toLocaleDateString('hi-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{item.titleEn || item.en}</p>
                    <p className="text-gray-700">{item.description}</p>
                    <a
                      href="#"
                      className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      और पढ़ें →
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/news"
                className="inline-flex items-center bg-orange-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                सभी समाचार देखें / View All News
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default News

