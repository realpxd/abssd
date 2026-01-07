import { useState, useEffect } from 'react'
import { useGallery } from '../hooks/useGallery.js'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { getImageUrl } from '../utils/imageUrl.js'

const GalleryPage = () => {
  const { data, isLoading, error } = useGallery()
  const [selectedImage, setSelectedImage] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Fallback to placeholder images if API fails or no data
  const allImages = data?.data || [
    { _id: 1, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', title: 'स्वच्छता अभियान', titleEn: 'Cleanliness Drive', category: 'cleanliness' },
    { _id: 2, imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', title: 'जलसेवा', titleEn: 'Water Service', category: 'water-service' },
    { _id: 3, imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', title: 'स्वयंसेवक', titleEn: 'Volunteers', category: 'cleanliness' },
    { _id: 4, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', title: 'मेले सेवा', titleEn: 'Fair Service', category: 'fair-service' },
    { _id: 5, imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800', title: 'एकादशी सेवा', titleEn: 'Ekadashi Service', category: 'ekadashi' },
    { _id: 6, imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', title: 'पर्यावरण जागरूकता', titleEn: 'Environmental Awareness', category: 'environment' },
  ]

  const categories = [
    { id: 'all', name: 'सभी / All', en: 'All' },
    { id: 'cleanliness', name: 'स्वच्छता अभियान', en: 'Cleanliness' },
    { id: 'water-service', name: 'जलसेवा', en: 'Water Service' },
    { id: 'toilet-management', name: 'शोचालय प्रबंधन', en: 'Toilet Management' },
    { id: 'fair-service', name: 'मेले सेवा', en: 'Fair Service' },
    { id: 'ekadashi', name: 'एकादशी सेवा', en: 'Ekadashi Service' },
    { id: 'environment', name: 'पर्यावरण', en: 'Environment' },
  ]

  const filteredImages = filter === 'all' 
    ? allImages 
    : allImages.filter(img => img.category === filter)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              गैलरी
            </h1>
            <p className="text-xl text-gray-600 mb-2">Gallery</p>
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-8"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              हमारे स्वच्छता अभियान, कार्यक्रमों और सेवाओं की झलकियाँ
              <br />
              Glimpses of our cleanliness campaigns, programs and services
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === cat.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
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
              <p>गैलरी लोड करने में त्रुटि। कृपया बाद में पुनः प्रयास करें।</p>
            </div>
          )}

          {/* Gallery Grid */}
          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {filteredImages.map((image) => (
                  <div
                    key={image._id || image.id}
                    className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={getImageUrl(image.imageUrl || image.src)}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                        <p className="text-sm text-gray-200">{image.titleEn || image.en}</p>
                      </div>
                    </div>
                    <div
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(image)
                      }}
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {filteredImages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">इस श्रेणी में कोई छवि नहीं मिली।</p>
                  <p className="text-sm text-gray-500 mt-2">No images found in this category.</p>
                </div>
              )}
            </>
          )}

          {/* Image Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              {/* inner wrapper stops propagation so clicking image doesn't close modal */}
              <div className="flex flex-col items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
                {/* Fixed-size container: image will scale down to fit, but won't be upscaled */}
                <div className="max-w-5xl w-full h-[70vh] flex items-center justify-center bg-black/0">
                  <img
                    src={getImageUrl(selectedImage.imageUrl || selectedImage.src)}
                    alt={selectedImage.title}
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
                    loading="lazy"
                  />
                </div>
                <div className="mt-6 text-center text-white w-full">
                  <h3 className="text-3xl font-bold mb-2">{selectedImage.title}</h3>
                  <p className="text-xl text-gray-300 mb-4">{selectedImage.titleEn || selectedImage.en}</p>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default GalleryPage

