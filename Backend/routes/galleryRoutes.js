const express = require('express')
const router = express.Router()
const {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require('../controllers/galleryController')
const { protect, optionalProtect, restrictToAdmin } = require('../middleware/auth')
const upload = require('../middleware/uploadGallery')

// Public route - get all active gallery items (or all if admin)
router.get('/', optionalProtect, getGallery)

// Helper middleware: only run multer when request is multipart/form-data
const conditionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || ''
  if (contentType.startsWith('multipart/form-data')) {
    return upload.single('image')(req, res, next)
  }
  return next()
}

// Admin routes - protected
router.post('/', protect, restrictToAdmin, conditionalUpload, createGalleryItem)
router.put('/:id', protect, restrictToAdmin, conditionalUpload, updateGalleryItem)
router.delete('/:id', protect, restrictToAdmin, deleteGalleryItem)

module.exports = router

