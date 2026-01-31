const AdminHeader = ({ username, onLogout }) => {
  return (
    <header className='bg-white shadow-sm border-b'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Admin Dashboard
            </h1>
            <p className='text-sm text-gray-600'>
              Welcome, {username || 'Admin'}
            </p>
          </div>
          <button
            onClick={onLogout}
            className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
