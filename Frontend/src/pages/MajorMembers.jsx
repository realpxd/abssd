import React from 'react'
import SEO from '../components/SEO'

const MEMBERS = [
  {
    id: 1,
    name: 'Jeetu Mali',
    role: 'राष्ट्रीय अध्यक्ष (President)',
    image: '/images/president.jpeg',
  },
  {
    id: 2,
    name: 'Akanksha Mali',
    role: 'महासचिव (General secretary)',
    image: '/images/gs.jpeg',
  },
  {
    id: 3,
    name: 'Umesh Gupta',
    role: 'कोषाध्यक्ष (cashier)',
    image: '/images/cashier.jpeg',
  },
]

const fallbackImageUrl = '/images/logo.jpg'

const MajorMembers = ({ lowHeight }) => {
  return (
    <div className={`bg-gradient-to-b from-orange-50 via-white to-orange-50 pt-16 pb-16 md:pb-0 ${lowHeight ? 'min-h-[50vh]' : 'min-h-[70vh]'}`}>
      {!lowHeight && <SEO 
        title="Core Team - Leadership"
        description="अखिल भारतीय स्वच्छता सेवा दल की नेतृत्व टीम से मिलें। राष्ट्रीय अध्यक्ष, महासचिव और मुख्य सदस्यों के बारे में जानें। Jeetu Mali, Akanksha Mali, Umesh Gupta।"
        canonical="/core-team"
      />}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">नेतृत्व टीम</h1>
          <p className="mt-3 text-lg text-gray-700 font-semibold">Core Team</p>
          <p className="mt-3 text-gray-600">हमारे ट्रस्ट और इसके मिशन का मार्गदर्शन करने वाली प्रमुख टीम से मिलें</p>
          <p className="mt-1 text-gray-600">Meet the core team guiding our trust and its mission</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 items-start justify-items-center">
          {MEMBERS.map((m) => (
            <div key={m.id} className="flex flex-col items-center text-center">
              <div className="w-44 h-44 rounded-full overflow-hidden bg-white shadow-sm">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    if (
                      e.target.src !== fallbackImageUrl &&
                      !e.target.src.includes('.jpg')
                    ) {
                      e.target.src = fallbackImageUrl
                    }
                  }}
                />
              </div>
              <div className="mt-4 text-lg font-semibold text-gray-900">{m.name}</div>
              <div className="text-sm text-orange-600 mt-1 font-medium">{m.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MajorMembers
