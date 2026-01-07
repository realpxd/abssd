import { getImageUrl } from '../../utils/imageUrl.js'

const NewsCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex gap-6">
        {item.imageUrl && (
          <img
            src={getImageUrl(item.imageUrl) || '/images/news-thumbnail.png'}
            alt={item.title}
            onError={(e) => {
              e.target.src = '/images/news-thumbnail.png'
            }}
            className="w-32 h-32 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-2">{item.title}</h3>
          <p className="text-gray-600 mb-2">{item.titleEn}</p>
          <p className="text-gray-700 mb-4">{item.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>📅 {new Date(item.date).toLocaleDateString()}</span>
            {item.location && <span>📍 {item.location}</span>}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(item)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsCard
