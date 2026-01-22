import { getImageUrl } from '../../utils/imageUrl.js'

const UsersList = ({ users, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'pending':
        return 'Pending'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                M.No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membership
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className='flex whitespace-nowrap h-full px-3 py-6'>
                    <span className='h-full text-center'># {user.memberNumber}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.photo ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={getImageUrl(user.photo)}
                          alt={user.username}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className='flex gap-1'>
                        <div className="text-sm text-gray-500">
                          {user.role === 'admin' && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        {user.position?.name !== 'Member' && <div className="text-sm text-gray-500">
                            <span className="text-xs bg-orange-100 text-black px-2 py-1 rounded">
                              {user.position?.name}
                            </span>
                        </div>}
                        {user.isTeamLeader && <div className="text-sm text-gray-500">
                            <span className="text-xs bg-green-100 text-black px-2 py-1 rounded">
                              {user.isTeamLeader ? 'Team Leader' : ''}
                            </span>
                        </div>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.contactNo || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.membershipType === 'annual' ? 'Annual' : 'Ordinary'}
                  </div>
                  {user.membershipAmount && (
                    <div className="text-xs text-gray-500">₹{user.membershipAmount}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      user.membershipStatus
                    )}`}
                  >
                    {getStatusText(user.membershipStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onViewDetails(user)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No users found.
        </div>
      )}
    </div>
  )
}

export default UsersList
