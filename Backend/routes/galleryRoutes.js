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

// Admin routes - protected
router.post('/', protect, restrictToAdmin, upload.single('image'), createGalleryItem)
router.put('/:id', protect, restrictToAdmin, upload.single('image'), updateGalleryItem)
router.delete('/:id', protect, restrictToAdmin, deleteGalleryItem)

module.exports = router

