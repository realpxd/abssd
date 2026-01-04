const Logo = ({ size = 'md', showText = false, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }

  // Logo image path - circular logo with orange ring, green circle, and Gandhi glasses
  const logoImageUrl = '/images/logo.png'
  const fallbackImageUrl = '/images/logo.jpg' // Try JPG if PNG not found

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <img
        src={logoImageUrl}
        alt="अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट - ABSSD Trust Logo"
        className="w-full h-full object-contain rounded-full notranslate"
        translate="no"
        onError={(e) => {
          // Fallback to JPG if PNG not found
          if (e.target.src !== fallbackImageUrl && !e.target.src.includes('.jpg')) {
            e.target.src = fallbackImageUrl
          }
        }}
              loading='lazy'
      />
    </div>
  )
}

export default Logo

