import { getImageUrl } from '../../utils/imageUrl.js';
import { FiEdit2, FiTrash2, FiCalendar, FiMapPin } from 'react-icons/fi';

const NewsCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className='bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200'>
      <div className='flex gap-4'>
        {item.imageUrl && (
          <div className='flex-shrink-0'>
            <img
              src={getImageUrl(item.imageUrl) || '/images/news-thumbnail.png'}
              alt={item.title}
              onError={(e) => {
                e.target.src = '/images/news-thumbnail.png';
              }}
              className='w-32 h-32 object-cover rounded-lg'
            />
          </div>
        )}
        <div className='flex-1'>
          <h3 className='font-semibold text-gray-900 text-sm mb-1'>
            {item.title}
          </h3>
          <p className='text-xs text-gray-500 mb-2'>{item.titleEn}</p>
          <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
            {item.description}
          </p>
          <div className='flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-4'>
            <span className='flex items-center gap-1'>
              <FiCalendar size={14} />
              {new Date(item.date).toLocaleDateString()}
            </span>
            {item.location && (
              <span className='flex items-center gap-1'>
                <FiMapPin size={14} />
                {item.location}
              </span>
            )}
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => onEdit(item)}
              className='flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200'
            >
              <FiEdit2 size={16} />
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className='flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200'
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
