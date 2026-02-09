import { FiX, FiDownload } from 'react-icons/fi';

const SocialCardImageModal = ({ card, onClose }) => {
  if (!card) return null;

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `${card.name.replace(/\s+/g, '_')}_social_card.png`;
    link.href = card.imageData;
    link.click();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4'>
      <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>{card.name}</h2>
            <p className='text-sm text-gray-500'>{card.address}</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition'
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Image */}
        <div className='p-6 flex justify-center'>
          <img
            src={card.imageData}
            alt={`${card.name}'s social card`}
            className='max-w-full h-auto rounded-lg shadow-lg'
          />
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-gray-200 flex justify-end gap-2'>
          <button
            onClick={downloadImage}
            className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2'
          >
            <FiDownload />
            Download Image
          </button>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialCardImageModal;
