import { FiLogOut, FiSettings } from 'react-icons/fi';

const AdminHeader = ({ username, onLogout }) => {
  return (
    <header className='bg-white border-b border-gray-200 shadow-sm'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-orange-100 p-2 rounded-lg'>
              <FiSettings size={24} className='text-orange-600' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Admin Dashboard
              </h1>
              <p className='text-sm text-gray-600 mt-0.5'>
                Welcome back,{' '}
                <span className='font-semibold'>{username || 'Admin'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className='flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 font-medium'
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
