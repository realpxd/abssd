const About = () => {
  const achievements = [
    { number: '10+', label: 'वर्षों का अनुभव', en: 'Years of Service' },
    { number: '500+', label: 'स्वयंसेवक', en: 'Volunteers' },
    { number: '1000+', label: 'सफाई अभियान', en: 'Cleanliness Drives' },
    { number: '24/7', label: 'सेवा', en: 'Service' },
  ]

  const services = [
    {
      icon: '🧹',
      title: 'स्वच्छता अभियान',
      en: 'Cleanliness Campaigns',
      description: 'खाटूधाम में नियमित स्वच्छता अभियान का संचालन',
    },
    {
      icon: '💧',
      title: 'जलसेवा',
      en: 'Water Service',
      description: 'श्रद्धालुओं के लिए पेयजल सुविधा उपलब्ध करवाना',
    },
    {
      icon: '🚻',
      title: 'शोचालय प्रबंधन',
      en: 'Toilet Management',
      description: 'शोचालयों की सफाई एवं जनसुविधा प्रबंधन',
    },
    {
      icon: '🎪',
      title: 'मेले सेवा',
      en: 'Fair Service',
      description: 'फाल्गुन मेले के दस दिवसीय विशेष सफाई अभियान',
    },
    {
      icon: '📅',
      title: 'एकादशी सेवा',
      en: 'Ekadashi Service',
      description: 'हर माह की एकादशी सेवा कार्य',
    },
    {
      icon: '🌿',
      title: 'पर्यावरण जागरूकता',
      en: 'Environmental Awareness',
      description: 'पर्यावरण संरक्षण के लिए जागरूकता कार्यक्रम',
    },
  ]

  return (
    <section id="about" className="py-20 md:py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative" style={{ marginTop: '-1px' }}>
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">About Us</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            हमारे बारे में
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 mx-auto rounded-full"></div>
        </div>

        {/* Main Content Card */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-3 notranslate" translate="no">
                  अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट
                </h3>
                <p className="text-xl text-orange-100 font-medium">(सेवा, समर्पण और स्वच्छता का संकल्प)</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  <span className="inline-block bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-base font-bold mr-2">वर्ष 2017 में स्थापित</span>
                  <span className="notranslate" translate="no">अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट</span> एक निःस्वार्थ सामाजिक संगठन है, जिसका उद्देश्य राष्ट्र को स्वच्छ, सुंदर और प्रेरणादायी बनाना है।
                </p>
                <p>
                  इस संस्था की नींव <span className="font-bold text-gray-900">श्री जीतू माली</span> ने <span className="font-bold text-orange-600">खाटूधाम (राजस्थान)</span> से रखी — जहाँ से यह आंदोलन पूरे भारत में जनसेवा और स्वच्छता का प्रतीक बन गया।
                </p>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border-l-4 border-orange-500">
                  <p className="mb-4">
                    पिछले <span className="font-bold text-orange-600 text-xl">10 वर्षों</span> से संगठन लगातार खाटूधाम में:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">📍</span>
                      <span><strong>स्वच्छता अभियान</strong> - नियमित सफाई कार्यक्रम</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">💧</span>
                      <span><strong>जलसेवा</strong> - वाटर कूलर स्थापना</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">🚻</span>
                      <span><strong>शोचालय प्रबंधन</strong> - सफाई एवं जनसुविधा</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">🎪</span>
                      <span><strong>मेले एवं एकादशी सेवा</strong> - विशेष अभियान</span>
                    </li>
                  </ul>
                </div>
                <p>
                  <span className="font-semibold text-gray-900">हर माह की एकादशी सेवा</span> और <span className="font-semibold text-orange-600">फाल्गुन मेले के दस दिवसीय विशेष सफाई अभियान</span> हमारी पहचान बन चुके हैं।
                </p>
                <p>
                  आज इस पवित्र अभियान से <span className="inline-block bg-orange-600 text-white px-3 py-1 rounded-full font-bold">500+ स्वयंसेवक</span> जुड़े हैं, जो निःस्वार्थ भाव से समाज के लिए कार्य कर रहे हैं।
                </p>
              </div>

              {/* Mission Box */}
              <div className="mt-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-3 opacity-90">हमारा लक्ष्य है —</p>
                  <p className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    "स्वच्छ भारत, सुंदर भारत,<br />और संस्कारवान भारत।"
                  </p>
                  <p className="text-lg opacity-90 leading-relaxed">
                    हम मानते हैं कि स्वच्छता केवल एक कार्य नहीं, बल्कि एक संस्कृति है — और इस संस्कृति को जन-जन तक पहुँचाना ही हमारा संकल्प है।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements - Enhanced Design */}
        <div className="mb-20">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            हमारी उपलब्धियां
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100"
              >
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                  {achievement.number}
                </div>
                <div className="text-base md:text-lg text-gray-800 font-bold mb-1">
                  {achievement.label}
                </div>
                <div className="text-xs md:text-sm text-gray-500">{achievement.en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Founder Info - Enhanced */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10 text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
                <span className="text-sm font-semibold uppercase tracking-wider">Founder & National President</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">संस्थापक एवं राष्ट्रीय अध्यक्ष</h3>
              <p className="text-3xl md:text-4xl font-bold mb-8 notranslate" translate="no">श्री जीतू माली</p>
              <div className="space-y-3 text-lg md:text-xl">
                <p className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📞</span>
                  <a href="tel:+918860442044" className="hover:underline font-semibold">+91 8860442044</a>
                </p>
                <p className="mt-6 notranslate" translate="no">
                  <span className="text-2xl mr-2">🌐</span>
                  अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

