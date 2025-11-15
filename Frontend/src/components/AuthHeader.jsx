import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'

const AuthHeader = ({ showBack = true }) => {
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center space-x-3">
              <Logo size="sm" />
              <div className="notranslate" translate="no">
                <h1 className="text-lg font-bold text-gray-800">अखिल भारतीय स्वच्छता सेवा दल</h1>
                <p className="text-xs text-gray-600">Akhil Bhartiya Swachta Sewa Dal</p>
              </div>
            </Link>
          </div>
          <Link
            to="/"
            className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm"
          >
            होम / Home
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default AuthHeader

