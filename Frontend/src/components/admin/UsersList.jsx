import { useState, useRef, useCallback, useMemo, memo } from 'react';
import { getImageUrl } from '../../utils/imageUrl.js';
import { FiEye, FiPrinter, FiChevronDown, FiLoader } from 'react-icons/fi';
import IDCard from '../IDCard.jsx';

// Helper functions outside component for better performance
const STATUS_CONFIG = {
  active: {
    color: 'bg-green-50 text-green-700 border border-green-200',
    text: 'Active',
  },
  pending: {
    color: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    text: 'Pending',
  },
  cancelled: {
    color: 'bg-red-50 text-red-700 border border-red-200',
    text: 'Cancelled',
  },
  default: {
    color: 'bg-gray-50 text-gray-700 border border-gray-200',
    text: 'Unknown',
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG.default;

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Memoized user row component
const UserRow = memo(
  ({
    user,
    index,
    totalUsers,
    isSelected,
    onSelect,
    onViewDetails,
    onPrintID,
  }) => {
    const statusConfig = getStatusConfig(user.membershipStatus);

    return (
      <tr className='hover:bg-gray-50 transition-colors duration-150'>
        <td className='px-3 py-4 whitespace-nowrap'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={() => onSelect(user._id)}
            className='w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500'
            aria-label={`Select ${user.username}`}
          />
        </td>
        <td className='px-3 py-4 whitespace-nowrap'>
          <span className='text-sm font-medium text-gray-700'>
            {totalUsers - index}.
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
                loading='lazy'
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
          <div className='text-sm text-gray-700'>{user.contactNo || '—'}</div>
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
            className={`px-2 py-1 inline-flex text-xs font-semibold rounded ${statusConfig.color}`}
          >
            {statusConfig.text}
          </span>
        </td>
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='flex gap-2'>
            <button
              onClick={() => onPrintID?.(user)}
              className='text-gray-600 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition-colors duration-200'
              title='Print ID'
              aria-label={`Print ID card for ${user.username}`}
            >
              <FiPrinter size={16} />
            </button>
            <button
              onClick={() => onViewDetails(user)}
              className='text-gray-600 hover:text-orange-600 p-1.5 hover:bg-orange-50 rounded transition-colors duration-200'
              title='View Details'
              aria-label={`View details for ${user.username}`}
            >
              <FiEye size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  },
);

UserRow.displayName = 'UserRow';

const UsersList = ({ users, onViewDetails, onPrintID }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printContainerRef = useRef(null);

  // Memoize callbacks
  const handleSelectAll = useCallback(
    (e) => {
      if (e.target.checked) {
        setSelectedUsers(users.map((u) => u._id));
      } else {
        setSelectedUsers([]);
      }
    },
    [users],
  );

  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const handleBulkPrintIDCards = useCallback(async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to print ID cards');
      return;
    }

    setIsPrinting(true);
    setShowBulkMenu(false);

    try {
      const selectedUserObjects = users.filter((u) =>
        selectedUsers.includes(u._id),
      );

      // Group users into chunks of 4 (2x2 grid per page)
      const pages = chunkArray(selectedUserObjects, 4);

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for this site to enable printing');
        return;
      }

      // Get all stylesheets from the current document
      const headNodes = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style'),
      );
      const headHtml = headNodes.map((n) => n.outerHTML).join('\n');

      // Create a temporary container to render all ID cards
      const tempContainer = document.createElement('div');
      tempContainer.style.display = 'none';
      document.body.appendChild(tempContainer);

      // Render all ID cards into the container
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempContainer);

      await new Promise((resolve) => {
        root.render(
          <div className='print-id-cards-container'>
            {pages.map((pageUsers, pageIdx) => (
              <div
                key={pageIdx}
                className='print-page'
                style={{
                  pageBreakAfter:
                    pageIdx < pages.length - 1 ? 'always' : 'auto',
                  pageBreakInside: 'avoid',
                  minHeight: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px',
                    maxWidth: '100%',
                  }}
                >
                  {pageUsers.map((user) => (
                    <div
                      key={user._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IDCard user={user} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>,
        );
        setTimeout(resolve, 500); // Wait for rendering
      });

      const cardsHtml = tempContainer.innerHTML;

      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);

      // Write to print window
      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            ${headHtml}
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #f3f4f6;
              }
              .print-id-cards-container {
                width: 100%;
              }
              .print-page {
                box-shadow: none !important;
              }
              @media print {
                body {
                  background: white;
                }
                .print-page {
                  box-shadow: none !important;
                }
                @page {
                  size: A4;
                  margin: 15mm;
                }
              }
            </style>
          </head>
          <body>
            ${cardsHtml}
          </body>
        </html>
      `);
      printWindow.document.close();

      // Trigger print after a short delay
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 750);
    } catch (error) {
      console.error('Error printing ID cards:', error);
      alert('Failed to print ID cards. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  }, [selectedUsers, users]);

  // Memoize expensive computations
  const isAllSelected = useMemo(
    () => selectedUsers.length === users.length && users.length > 0,
    [selectedUsers.length, users.length],
  );

  const selectedUsersSet = useMemo(
    () => new Set(selectedUsers),
    [selectedUsers],
  );

  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className='bg-orange-50 border-b border-orange-200 px-4 py-3 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-orange-900'>
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}{' '}
              selected
            </span>
            <button
              onClick={handleClearSelection}
              className='text-xs text-orange-700 hover:text-orange-900 underline'
              aria-label='Clear selection'
            >
              Clear selection
            </button>
          </div>
          <div className='relative'>
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              disabled={isPrinting}
              className='flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Bulk actions menu'
            >
              {isPrinting ? (
                <>
                  <FiLoader className='animate-spin' size={16} />
                  Processing...
                </>
              ) : (
                <>
                  Bulk Actions
                  <FiChevronDown size={16} />
                </>
              )}
            </button>
            {showBulkMenu && !isPrinting && (
              <>
                <div
                  className='fixed inset-0 z-10'
                  onClick={() => setShowBulkMenu(false)}
                />
                <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20'>
                  <button
                    onClick={handleBulkPrintIDCards}
                    className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'
                    aria-label='Print selected ID cards'
                  >
                    <FiPrinter size={16} />
                    Print ID Cards ({selectedUsers.length})
                  </button>
                  {/* Add more bulk actions here as needed */}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-3 py-3 text-left'>
                <input
                  type='checkbox'
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className='w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500'
                  aria-label='Select all users'
                />
              </th>
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
              <UserRow
                key={user._id}
                user={user}
                index={index}
                totalUsers={users.length}
                isSelected={selectedUsersSet.has(user._id)}
                onSelect={handleSelectUser}
                onViewDetails={onViewDetails}
                onPrintID={onPrintID}
              />
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

export default memo(UsersList);
