const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-pulse'
          >
            <div className='h-48 bg-gray-200' />
            <div className='p-5'>
              <div className='h-5 bg-gray-200 rounded w-2/3 mb-3' />
              <div className='h-4 bg-gray-100 rounded w-1/2 mb-4' />
              <div className='space-y-2 mb-4'>
                <div className='h-3 bg-gray-100 rounded' />
                <div className='h-3 bg-gray-100 rounded w-5/6' />
              </div>
              <div className='flex gap-2'>
                <div className='flex-1 h-9 bg-gray-200 rounded-lg' />
                <div className='flex-1 h-9 bg-gray-200 rounded-lg' />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'table-row') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <tr key={i} className='border-b border-gray-100 animate-pulse'>
            <td className='px-3 py-5'>
              <div className='h-4 bg-gray-200 rounded w-8' />
            </td>
            <td className='px-3 py-5'>
              <div className='h-4 bg-gray-200 rounded w-12' />
            </td>
            <td className='px-6 py-5'>
              <div className='h-4 bg-gray-200 rounded w-32' />
            </td>
            <td className='px-6 py-5'>
              <div className='h-4 bg-gray-200 rounded w-40' />
            </td>
            <td className='px-6 py-5'>
              <div className='h-4 bg-gray-200 rounded w-24' />
            </td>
            <td className='px-6 py-5'>
              <div className='h-4 bg-gray-200 rounded w-20' />
            </td>
            <td className='px-6 py-5'>
              <div className='h-6 bg-gray-200 rounded-full w-16' />
            </td>
            <td className='px-6 py-5'>
              <div className='h-4 bg-gray-200 rounded w-16' />
            </td>
            <td className='px-6 py-5'>
              <div className='h-4 bg-gray-200 rounded w-24' />
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (type === 'list-item') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className='flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg animate-pulse mb-3'
          >
            <div className='flex-1'>
              <div className='h-5 bg-gray-200 rounded w-32 mb-2' />
              <div className='h-3 bg-gray-100 rounded w-64' />
            </div>
            <div className='h-9 bg-gray-200 rounded-lg w-20' />
          </div>
        ))}
      </>
    );
  }

  if (type === 'form') {
    return (
      <div className='space-y-6 animate-pulse'>
        <div className='space-y-2'>
          <div className='h-4 bg-gray-200 rounded w-24' />
          <div className='h-10 bg-gray-100 rounded-lg' />
        </div>
        <div className='space-y-2'>
          <div className='h-4 bg-gray-200 rounded w-24' />
          <div className='h-10 bg-gray-100 rounded-lg' />
        </div>
        <div className='space-y-2'>
          <div className='h-4 bg-gray-200 rounded w-24' />
          <div className='h-24 bg-gray-100 rounded-lg' />
        </div>
        <div className='flex gap-2'>
          <div className='h-10 bg-gray-200 rounded-lg w-24' />
          <div className='h-10 bg-gray-200 rounded-lg w-24' />
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
