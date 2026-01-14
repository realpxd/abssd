const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-4 mb-8 border-b">
      <button
        onClick={() => onTabChange('gallery')}
        className={`px-6 py-3 font-medium ${
          activeTab === 'gallery'
            ? 'border-b-2 border-orange-600 text-orange-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Gallery Management
      </button>
      <button
        onClick={() => onTabChange('news')}
        className={`px-6 py-3 font-medium ${
          activeTab === 'news'
            ? 'border-b-2 border-orange-600 text-orange-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        News Management
      </button>
      <button
        onClick={() => onTabChange('users')}
        className={`px-6 py-3 font-medium ${
          activeTab === 'users'
            ? 'border-b-2 border-orange-600 text-orange-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        User Management
      </button>
      <button
        onClick={() => onTabChange('create-user')}
        className={`px-6 py-3 font-medium ${
          activeTab === 'create-user'
            ? 'border-b-2 border-orange-600 text-orange-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Create User
      </button>
      <button
        onClick={() => onTabChange('positions')}
        className={`px-6 py-3 font-medium ${
          activeTab === 'positions'
            ? 'border-b-2 border-orange-600 text-orange-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Positions
      </button>
    </div>
  )
}

export default TabNavigation
