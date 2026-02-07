import { sanitizeText, validateFileUpload } from '../../utils/security.js';

const GalleryForm = ({
  formData,
  editingId,
  onSubmit,
  onChange,
  onCancel,
  submitting,
}) => {
  const handleTextChange = (field, value) => {
    onChange({ ...formData, [field]: sanitizeText(value) });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
      onChange({ ...formData, imageFile: file });
    }
  };

  return (
    <form onSubmit={(e) => onSubmit(e, editingId)} className='space-y-4'>
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Title (Hindi)
          </label>
          <input
            type='text'
            value={formData.title}
            onChange={(e) => handleTextChange('title', e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Title (English)
          </label>
          <input
            type='text'
            value={formData.titleEn}
            onChange={(e) => handleTextChange('titleEn', e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg'
          />
        </div>
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleTextChange('description', e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg'
          rows='3'
        />
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => onChange({ ...formData, category: e.target.value })}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg'
        >
          <option value='cleanliness'>Cleanliness</option>
          <option value='water-service'>Water Service</option>
          <option value='toilet-management'>Toilet Management</option>
          <option value='fair-service'>Fair Service</option>
          <option value='ekadashi'>Ekadashi</option>
          <option value='environment'>Environment</option>
          <option value='others'>Others</option>
        </select>
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {editingId && !formData.imageFile
            ? 'Image URL (or upload new image)'
            : 'Upload Image'}
        </label>
        {!editingId || formData.imageFile ? (
          <input
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg'
            required={!editingId}
          />
        ) : (
          <div className='space-y-2'>
            <input
              type='text'
              value={formData.imageUrl}
              onChange={(e) =>
                onChange({ ...formData, imageUrl: e.target.value })
              }
              placeholder='Image URL'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg mb-2'
            />
            <button
              type='button'
              onClick={() =>
                onChange({ ...formData, imageFile: null, imageUrl: '' })
              }
              className='text-sm text-orange-600 hover:text-orange-700'
            >
              Or upload new image
            </button>
            <input
              type='file'
              accept='image/*'
              onChange={(e) =>
                onChange({
                  ...formData,
                  imageFile: e.target.files[0],
                  imageUrl: '',
                })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg'
            />
          </div>
        )}
      </div>
      <div className='flex space-x-4'>
        <button
          type='submit'
          className={`bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 ${submitting ? 'opacity-80 cursor-not-allowed' : ''}`}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'} Item
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400'
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default GalleryForm;
