import {
  FiImage,
  FiFileText,
  FiUsers,
  FiTarget,
  FiShare2,
} from 'react-icons/fi';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'gallery', label: 'Gallery', icon: FiImage },
    { id: 'news', label: 'News', icon: FiFileText },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'positions', label: 'Positions', icon: FiTarget },
    { id: 'social-cards', label: 'Social Cards', icon: FiShare2 },
  ];

  return (
    <div className='mb-8 bg-white border-b border-gray-200 rounded-lg shadow-sm'>
      <div className='flex items-center gap-1 overflow-x-auto px-2'>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 font-medium whitespace-nowrap transition-all duration-200 rounded-t-lg border-b-2 ${
                activeTab === tab.id
                  ? 'border-orange-600 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
