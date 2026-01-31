import { getImageUrl } from '../../utils/imageUrl.js';
import { FiEye, FiPrinter } from 'react-icons/fi';

const UsersList = ({ users, onViewDetails, onPrintID }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                No.
              </th>
              <th className='px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                M.No.
              </th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                User
              </th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Email
              </th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Contact
              </th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Membership
              </th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {users.map((user, index) => (
              <tr
                key={user._id}
                className='hover:bg-gray-50 transition-colors duration-150'
              >
                <td className='px-3 py-4 whitespace-nowrap'>
                  <span className='text-sm font-medium text-gray-700'>
                    {users.length - index}.
                  </span>
                </td>
                <td className='px-3 py-4 whitespace-nowrap'>
                  <span className='text-sm font-semibold text-orange-600'>
                    #{user.memberNumber}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center gap-3'>
                    {user.photo ? (
                      <img
                        className='h-9 w-9 rounded-full object-cover'
                        src={getImageUrl(user.photo)}
                        alt={user.username}
                      />
                    ) : (
                      <div className='h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm'>
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {user.username}
                      </div>
                      <div className='flex gap-1 flex-wrap mt-0.5'>
                        {user.role === 'admin' && (
                          <span className='text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium'>
                            Admin
                          </span>
                        )}
                        {user.position?.name !== 'Member' && (
                          <span className='text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium'>
                            {user.position?.name}
                          </span>
                        )}
                        {user.isTeamLeader && (
                          <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium'>
                            Leader
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-700'>{user.email}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-700'>
                    {user.contactNo || '—'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>
                    {user.membershipType === 'annual' ? 'Annual' : 'Ordinary'}
                  </div>
                  {user.membershipAmount && (
                    <div className='text-xs text-gray-500'>
                      ₹{user.membershipAmount}
                    </div>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 py-1 inline-flex text-xs font-semibold rounded ${getStatusColor(
                      user.membershipStatus,
                    )}`}
                  >
                    {getStatusText(user.membershipStatus)}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => onPrintID && onPrintID(user)}
                      className='text-gray-600 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition-colors duration-200'
                      title='Print ID'
                    >
                      <FiPrinter size={16} />
                    </button>
                    <button
                      onClick={() => onViewDetails(user)}
                      className='text-gray-600 hover:text-orange-600 p-1.5 hover:bg-orange-50 rounded transition-colors duration-200'
                      title='View Details'
                    >
                      <FiEye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <div className='text-center py-12 text-gray-500'>
          <p className='font-medium'>No users found.</p>
        </div>
      )}
    </div>
  );
};

export default UsersList;
