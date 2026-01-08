const NewsForm = ({ formData, editingId, onSubmit, onChange, onCancel, submitting }) => {
  return (
    <form onSubmit={(e) => onSubmit(e, editingId)} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title (Hindi)</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onChange({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
          <input
            type="text"
            value={formData.titleEn}
            onChange={(e) => onChange({ ...formData, titleEn: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          rows="4"
          required
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => onChange({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => onChange({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {editingId && !formData.imageFile ? 'Image URL (or upload new image)' : 'Upload Image'}
        </label>
        {!editingId || formData.imageFile ? (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onChange({ ...formData, imageFile: e.target.files[0] })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => onChange({ ...formData, imageUrl: e.target.value })}
              placeholder="Image URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
            />
            <button
              type="button"
              onClick={() => onChange({ ...formData, imageFile: null, imageUrl: '' })}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              Or upload new image
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onChange({ ...formData, imageFile: e.target.files[0], imageUrl: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}
      </div>
      <div className="flex space-x-4">
        <button
          type="submit"
          className={`bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 ${submitting ? 'opacity-80 cursor-not-allowed' : ''}`}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'} News
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default NewsForm
