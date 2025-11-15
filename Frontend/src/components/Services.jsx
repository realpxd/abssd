const Services = () => {
  const mainServices = [
    {
      title: 'स्वच्छता अभियान',
      en: 'Cleanliness Campaigns',
      description: 'खाटूधाम में नियमित स्वच्छता अभियान का संचालन करना। हर माह की एकादशी सेवा और फाल्गुन मेले के दस दिवसीय विशेष सफाई अभियान हमारी पहचान बन चुके हैं।',
      icon: '🧹',
      bgColor: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
    },
    {
      title: 'जलसेवा',
      en: 'Water Service',
      description: 'संस्थान ने खाटूधाम के प्रमुख स्थानों पर वाटर कूलर स्थापित किए हैं, ताकि देश-विदेश से आने वाले श्रद्धालुओं को स्वच्छ पेयजल मिल सके।',
      icon: '💧',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      title: 'सोचालय प्रबंधन',
      en: 'Toilet Management',
      description: 'सोचालयों की सफाई एवं जनसुविधा प्रबंधन। सोचालयों पर पेयजल एवं अन्य सुविधाएँ उपलब्ध करवाईं, ताकि श्रद्धालुओं को स्वच्छ वातावरण और सुविधा मिल सके।',
      icon: '🚻',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      title: 'मेले एवं एकादशी सेवा',
      en: 'Fair & Ekadashi Service',
      description: 'हर माह की एकादशी सेवा कार्य और फाल्गुन मेले के दस दिवसीय विशेष सफाई अभियान का संचालन। ये कार्यक्रम हमारी पहचान बन चुके हैं।',
      icon: '🎪',
      bgColor: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
    {
      title: 'पर्यावरण जागरूकता',
      en: 'Environmental Awareness',
      description: 'पर्यावरण संरक्षण के लिए जागरूकता कार्यक्रमों का संचालन करना और लोगों को स्वच्छता के महत्व के बारे में शिक्षित करना।',
      icon: '🌿',
      bgColor: 'bg-emerald-600',
      hoverColor: 'hover:bg-emerald-700',
    },
  ]

  return (
    <section id="services" className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">Our Services</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            हमारी सेवाएं
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 mx-auto rounded-full"></div>
          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            Comprehensive cleanliness and service solutions for a better India
          </p>
        </div>

        {/* Services Grid - Clean Design */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-20">
          {mainServices.map((service, index) => (
            <div
              key={index}
              className={`group ${service.bgColor} ${service.hoverColor} rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold mb-2">{service.title}</h3>
              <p className="text-white/90 font-medium mb-4 text-lg">{service.en}</p>
              
              {/* Description */}
              <p className="text-white/95 leading-relaxed text-base">{service.description}</p>
            </div>
          ))}
        </div>

        {/* Mission Statement - Enhanced */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl shadow-2xl p-10 md:p-16 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mt-36"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32"></div>
            <div className="relative z-10 text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
                <span className="text-sm font-semibold uppercase tracking-wider">Our Mission</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-8">हमारा लक्ष्य</h3>
              <p className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                "स्वच्छ भारत, सुंदर भारत,<br />और संस्कारवान भारत।"
              </p>
              <p className="text-xl mb-6 opacity-90">
                "Clean India, Beautiful India, and Cultured India."
              </p>
              <div className="w-24 h-1 bg-white/30 mx-auto mb-6"></div>
              <p className="text-lg md:text-xl leading-relaxed opacity-95 max-w-3xl mx-auto">
                हम मानते हैं कि स्वच्छता केवल एक कार्य नहीं, बल्कि एक संस्कृति है — और इस संस्कृति को जन-जन तक पहुँचाना ही हमारा संकल्प है।
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services

