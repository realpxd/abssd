import { FiX } from 'react-icons/fi';

const FormModal = ({ show, title, onClose, children }) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop with animation */}
      <div
        className='fixed inset-0 bg-black/40 z-40 backdrop-blur-sm animate-in fade-in duration-200'
        onClick={onClose}
      />

      {/* Modal with animation */}
      <div className='fixed inset-0 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200'>
        <div className='bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-2xl'>
          {/* Header */}
          <div className='bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10'>
            <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200'
              aria-label='Close modal'
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className='p-6'>{children}</div>
        </div>
      </div>
    </>
  );
};

export default FormModal;
