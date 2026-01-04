import { handleSmoothScroll } from '../utils/smoothScroll.js'

const Hero = () => {
  // Volunteer image path
  const volunteerImageUrl = '/images/volunteers.png'
  const fallbackImageUrl = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=800&fit=crop'

  return (
    <section className="relative bg-[#F9F6F7]">
      {/* Upper Section - Text Content */}
      <div className="py-16 md:py-24 lg:pt-32 lg:pb-0">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Main Headline */}
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                स्वच्छ भारत, सुंदर भारत
                <br />
                <span className="text-orange-600">संस्कारवान भारत</span>
              </h1>
            </div>

            {/* Description */}
            {/* <div className="text-center mb-12">
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
                Clean India, Beautiful India, Cultured India
                <br />
                <span className="text-gray-700">सेवा, समर्पण और स्वच्छता का संकल्प</span>
              </p>
              <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed notranslate" translate="no">
                अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट - 2017 से राष्ट्र को स्वच्छ, सुंदर और प्रेरणादायी बनाने के लिए समर्पित
              </p>
            </div> */}

            {/* CTA Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="#join"
                onClick={(e) => handleSmoothScroll(e, '#join', 80)}
                className="bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer text-center"
              >
                हमसे जुड़ें / Join Us
              </a>
              <a
                href="#about"
                onClick={(e) => handleSmoothScroll(e, '#about', 80)}
                className="bg-white border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-50 transition-all cursor-pointer text-center"
              >
                और जानें / Learn More
              </a>
            </div> */}

            {/* Badge/Tag */}
            <div className="text-center">
              <span className="inline-block bg-orange-100 text-orange-700 px-6 py-2 rounded-full text-sm font-medium">
                🧹 सेवा, समर्पण और स्वच्छता का संकल्प
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section - Volunteer Image */}
      <div className="w-full">
        <div className="relative">
          <div className="aspect-[16/9] md:aspect-[16/8] w-full">
            <img
              src={volunteerImageUrl}
              alt="अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट के स्वयंसेवक - स्वच्छता अभियान में समर्पित"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if local image not found
                if (e.target.src !== fallbackImageUrl) {
                  e.target.src = fallbackImageUrl
                }
              }}
            />
          </div>
          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Wave transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none" style={{ marginBottom: '-1px' }}>
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 md:h-20"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#F9FAFB"
            className="transition-colors"
          />
        </svg>
      </div>
    </section>
  )
}

export default Hero

