import { Link, useLocation, useNavigate } from 'react-router-dom'
import { handleSmoothScroll } from '../utils/smoothScroll.js'
import Logo from './Logo.jsx'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const location = useLocation()
  const navigate = useNavigate()

  const handleFooterNavClick = (e, href) => {
    e.preventDefault()
    
    // If we're not on the homepage, navigate there first
    if (location.pathname !== '/') {
      navigate('/')
      // Set hash after a brief delay to ensure navigation completes
      // The Home component's useEffect will handle scrolling
      setTimeout(() => {
        window.location.hash = href.replace('#', '')
      }, 50)
    } else {
      // We're already on homepage, just scroll
      handleSmoothScroll(e, href, 80)
    }
  }

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Logo size="md" />
              <div className="notranslate" translate="no">
                <h3 className="font-bold text-lg">अखिल भारतीय स्वच्छता सेवा दल</h3>
                <p className="text-sm text-gray-400">Akhil Bhartiya Swachta Sewa Dal</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              सेवा, समर्पण और स्वच्छता का संकल्प - 2017 से राष्ट्र को स्वच्छ, सुंदर और प्रेरणादायी बनाने के लिए समर्पित।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">महत्वपूर्ण लिंक्स</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => handleFooterNavClick(e, '#about')}
                  className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  हमारे बारे में
                </a>
              </li>
              <li>
                <a 
                  href="#services" 
                  onClick={(e) => handleFooterNavClick(e, '#services')}
                  className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  सेवाएं
                </a>
              </li>
              <li>
                <Link 
                  to="/gallery"
                  className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  गैलरी
                </Link>
              </li>
              <li>
                <Link 
                  to="/news"
                  className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  समाचार
                </Link>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleFooterNavClick(e, '#contact')}
                  className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  संपर्क करें
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">संपर्क सूत्र</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📞 +91 8860442044</li>
              <li>📮 info@abssd.org</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm notranslate" translate="no">
            Copyright © {currentYear} अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

