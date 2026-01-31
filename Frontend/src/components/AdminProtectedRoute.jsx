import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/admin/login' replace />;
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Access Denied
          </h1>
          <p className='text-gray-600 mb-6'>
            You do not have admin privileges.
          </p>
          <a
            href='/'
            className='inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700'
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;
