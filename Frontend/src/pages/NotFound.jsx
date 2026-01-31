import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4'>
      <SEO
        title='Page Not Found - 404 Error'
        description='यह पृष्ठ नहीं मिला। आप गलत URL में हो सकते हैं या पृष्ठ स्थानांतरित किया गया है।'
        canonical='*'
        robots='noindex, follow'
      />
      <div className='text-center max-w-2xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-9xl font-bold text-gray-800 mb-4'>404</h1>
          <h2 className='text-4xl font-semibold text-gray-700 mb-4'>
            Page Not Found
          </h2>
          <p className='text-lg text-gray-600 mb-8'>
            Oops! The page you're looking for doesn't exist. It might have been
            moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <Link
            to='/'
            className='px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg'
          >
            Go Back Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className='px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200'
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
