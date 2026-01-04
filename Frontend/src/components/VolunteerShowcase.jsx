const VolunteerShowcase = () => {
  // TODO: Replace with actual volunteer image
  // Place the image file in: Frontend/public/images/volunteers.jpg
  // Or update this URL to point to your image
  const volunteerImageUrl = '/images/volunteers.png' // Local image path
  // Fallback to placeholder if image not found
  const fallbackImageUrl = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=800&fit=crop'

  return (
    <section className="relative bg-white py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Text Content Section */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              स्वच्छता सेवा में
              <br />
              <span className="text-orange-600">समर्पित स्वयंसेवक</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
              Dedicated volunteers serving the nation with cleanliness and devotion
              <br />
              <span className="text-gray-700">निरंतर सेवा, निःस्वार्थ समर्पण</span>
            </p>
            <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto mt-4 leading-relaxed">
              हमारे <span className="text-orange-600 font-semibold">500+ स्वयंसेवक</span> निःस्वार्थ भाव से राष्ट्र को स्वच्छ, सुंदर और प्रेरणादायी बनाने के लिए समर्पित हैं।
              <br />
              <span className="text-orange-600 font-semibold">खाटूधाम में निरंतर सेवा</span> - हर माह की एकादशी सेवा और फाल्गुन मेले के विशेष अभियान।
            </p>
          </div>

          {/* Image Section - Large image at bottom like reference design */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/10] w-full">
              <img
                src={volunteerImageUrl}
                alt="अखिल भारतीय स्वच्छता सेवा दल के स्वयंसेवक - स्वच्छता अभियान में समर्पित"
                className="w-full h-full object-cover blend-multiply"
                onError={(e) => {
                  // Fallback to placeholder if local image not found
                  if (e.target.src !== fallbackImageUrl) {
                    e.target.src = fallbackImageUrl
                  }
                }}
              />
            </div>
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
          </div>

          {/* Stats Section Below Image */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">10+</div>
              <div className="text-sm md:text-base text-gray-700 font-medium">वर्षों का अनुभव</div>
              <div className="text-xs text-gray-500 mt-1">Years of Service</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-sm md:text-base text-gray-700 font-medium">स्वयंसेवक</div>
              <div className="text-xs text-gray-500 mt-1">Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">1000+</div>
              <div className="text-sm md:text-base text-gray-700 font-medium">सफाई अभियान</div>
              <div className="text-xs text-gray-500 mt-1">Cleanliness Drives</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-sm md:text-base text-gray-700 font-medium">सेवा</div>
              <div className="text-xs text-gray-500 mt-1">Service</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VolunteerShowcase

