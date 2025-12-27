import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../hooks/useGallery.js'
import { getImageUrl } from '../utils/imageUrl.js'

const Gallery = () => {
  const { data, isLoading, error } = useGallery()
  const [selectedImage, setSelectedImage] = useState(null)

  // Fallback to placeholder images if API fails or no data
  const allImages = data?.data || [
    { _id: 1, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', title: 'स्वच्छता अभियान', titleEn: 'Cleanliness Drive' },
    { _id: 2, imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', title: 'जलसेवा', titleEn: 'Water Service' },
    { _id: 3, imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', title: 'स्वयंसेवक', titleEn: 'Volunteers' },
    { _id: 4, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', title: 'मेले सेवा', titleEn: 'Fair Service' },
    { _id: 5, imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800', title: 'एकादशी सेवा', titleEn: 'Ekadashi Service' },
    { _id: 6, imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', title: 'पर्यावरण जागरूकता', titleEn: 'Environmental Awareness' },
  ]

  // Show only first 6 images on homepage
  const galleryImages = allImages.slice(0, 6)

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            गैलरी
          </h2>
          <p className="text-xl text-gray-600 mb-2">Gallery</p>
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
            <p>गैलरी लोड करने में त्रुटि। कृपया बाद में पुनः प्रयास करें।</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
              {galleryImages.map((image) => (
                <div
                  key={image._id || image.id}
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={getImageUrl(image.imageUrl || image.src)}
                    alt={image.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                      <p className="text-sm text-gray-200">{image.titleEn || image.en}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/gallery"
                className="inline-flex items-center bg-orange-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                सभी देखें / View All
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl w-full">
              <img
                src={getImageUrl(selectedImage.imageUrl || selectedImage.src)}
                alt={selectedImage.title}
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                <p className="text-gray-300">{selectedImage.titleEn || selectedImage.en}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
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
    </section>
  )
}

export default Gallery

