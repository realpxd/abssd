const FormModal = ({ show, title, onClose, children }) => {
  if (!show) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 absolute h-full top-0 left-0 right-0 z-10 pt-10 px-10 md:pt-20 md:px-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  )
}

export default FormModal
