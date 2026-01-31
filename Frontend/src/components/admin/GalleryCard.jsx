import { getImageUrl } from '../../utils/imageUrl.js';

const GalleryCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className='bg-white rounded-lg shadow-md overflow-hidden'>
      <img
        src={
          getImageUrl(item.imageUrl) || 'https://via.placeholder.com/400x300'
        }
        alt={item.title}
        className='w-full h-48 object-cover'
      />
      <div className='p-4'>
        <h3 className='font-bold text-lg mb-2'>{item.title}</h3>
        <p className='text-sm text-gray-600 mb-2'>{item.titleEn}</p>
        <p className='text-sm text-gray-500 mb-4 line-clamp-2'>
          {item.description}
        </p>
        <div className='flex space-x-2'>
          <button
            onClick={() => onEdit(item)}
            className='flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm'
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className='flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm'
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
