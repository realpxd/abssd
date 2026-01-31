import { getImageUrl } from '../../utils/imageUrl.js';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const GalleryCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200'>
      <div className='relative h-48 overflow-hidden bg-gray-100'>
        <img
          src={
            getImageUrl(item.imageUrl) || 'https://via.placeholder.com/400x300'
          }
          alt={item.title}
          className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
        />
        <div className='absolute top-3 right-3 bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold'>
          {item.category}
        </div>
      </div>
      <div className='p-4'>
        <h3 className='font-semibold text-gray-900 text-sm mb-1 line-clamp-2'>
          {item.title}
        </h3>
        <p className='text-xs text-gray-500 mb-3'>{item.titleEn}</p>
        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
          {item.description}
        </p>
        <div className='flex gap-2'>
          <button
            onClick={() => onEdit(item)}
            className='flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200'
          >
            <FiEdit2 size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className='flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200'
          >
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
