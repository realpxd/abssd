import { useState } from 'react';
import { FiEye, FiDownload, FiTrash2 } from 'react-icons/fi';

const SocialCardsList = ({ socialCards, onDelete, onViewImage, stats }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = socialCards.filter((card) => {
    const query = searchQuery.toLowerCase();
    return (
      card.name.toLowerCase().includes(query) ||
      card.address.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='text-blue-600 text-sm font-medium'>
            Total Submissions
          </div>
          <div className='text-2xl font-bold text-blue-900'>
            {stats?.total || 0}
          </div>
        </div>
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <div className='text-green-600 text-sm font-medium'>
            Generated Cards
          </div>
          <div className='text-2xl font-bold text-green-900'>
            {stats?.generated || 0}
          </div>
        </div>
        <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
          <div className='text-orange-600 text-sm font-medium'>
            Not Generated
          </div>
          <div className='text-2xl font-bold text-orange-900'>
            {stats?.notGenerated || 0}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className='bg-white rounded-lg p-4 shadow-sm'>
        <input
          type='text'
          placeholder='Search by name or city...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
        />
      </div>

      {/* Cards List */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Sr. No.
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  City
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created At
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredCards.length === 0 ? (
                <tr>
                  <td
                    colSpan='6'
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    {searchQuery
                      ? 'No matching social cards found'
                      : 'No social cards yet'}
                  </td>
                </tr>
              ) : (
                filteredCards.map((card, index) => (
                  <tr key={card._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {index + 1}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {card.name}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-500'>
                        {card.address}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          card.generated
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {card.generated ? 'Generated' : 'Not Generated'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(card.createdAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                      {card.generated && card.imageData && (
                        <button
                          onClick={() => onViewImage(card)}
                          className='text-blue-600 hover:text-blue-900 inline-flex items-center gap-1'
                          title='View Image'
                        >
                          <FiEye size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(card._id)}
                        className='text-red-600 hover:text-red-900 inline-flex items-center gap-1'
                        title='Delete'
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SocialCardsList;
