import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { handleSmoothScroll } from '../utils/smoothScroll.js'
import Logo from './Logo.jsx'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { name: 'हमारे बारे में', href: '#about', en: 'About Us', type: 'anchor' },
    { name: 'सेवाएं', href: '#services', en: 'Services', type: 'anchor' },
    { name: 'गैलरी', href: '/gallery', en: 'Gallery', type: 'route' },
    { name: 'समाचार', href: '/news', en: 'News', type: 'route' },
    { name: 'नेतृत्व टीम', href: '/core-team', en: 'Leadership', type: 'route' },
    { name: 'संपर्क करें', href: '#contact', en: 'Contact', type: 'anchor' },
  ]

  const handleNavClick = (e, item) => {
    e.preventDefault()
    
    if (item.type === 'anchor') {
      // If we're not on the homepage, navigate there first
      if (location.pathname !== '/') {
        navigate('/')
        // Set hash after a brief delay to ensure navigation completes
        // The Home component's useEffect will handle scrolling
        setTimeout(() => {
          window.location.hash = item.href.replace('#', '')
        }, 50)
      } else {
        // We're already on homepage, just scroll
        handleSmoothScroll(e, item.href, 80)
      }
    }
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Logo size="md" />
            <div className="notranslate" translate="no">
              <h1 className="text-xl font-bold text-gray-800">अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट</h1>
              <p className="text-xs text-gray-600">Akhil Bhartiya Swachta Sewa Dal Trust</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              if (item.type === 'route') {
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => {
                      if(item.href === '/gallery' || item.href === '/news' || item.href === '/core-team') {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    className="text-gray-700 hover:text-orange-500 font-medium transition-colors cursor-pointer"
                  >
                    <span className="hidden lg:inline">{item.name}</span>
                    <span className="lg:hidden">{item.en}</span>
                  </Link>
                )
              }
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors cursor-pointer"
                >
                  <span className="hidden lg:inline">{item.name}</span>
                  <span className="lg:hidden">{item.en}</span>
                </a>
              )
            })}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium"
              >
                प्रोफ़ाइल / Profile
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  लॉगिन / Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium"
                >
                  जुड़ें / Join
                </Link>
              </>
            )}

            <div className="text-center">
              <a
                href="/donation"
                className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                मदद का हाथ बढ़ाएं / Extend Help
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {navItems.map((item) => {
              if (item.type === 'route') {
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block py-2 text-gray-700 hover:text-orange-500 font-medium cursor-pointer"
                    onClick={() => {
                      setIsMenuOpen(false)
                      if(item.href === '/gallery' || item.href === '/news') {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                  >
                    {item.name} ({item.en})
                  </Link>
                )
              }
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-orange-500 font-medium cursor-pointer"
                  onClick={(e) => handleNavClick(e, item)}
                >
                  {item.name} ({item.en})
                </a>
              )
            })}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="block bg-orange-500 text-white px-6 py-2 rounded-full text-center hover:bg-orange-600 transition-colors font-medium mt-4"
              >
                प्रोफ़ाइल / Profile
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  लॉगिन / Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-orange-500 text-white px-6 py-2 rounded-full text-center hover:bg-orange-600 transition-colors font-medium mt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  जुड़ें / Join
                </Link>
              </>
            )}
            <div className="mt-4">
              <a
                href="/donation"
                className="block bg-orange-600 text-white px-6 py-3 rounded-lg font-bold text-center hover:bg-orange-700 transition-colors shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                मदद का हाथ बढ़ाएं / Extend Help
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header

