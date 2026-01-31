const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const {
  protect,
  optionalProtect,
  restrictToAdmin,
} = require('../middleware/auth');
const upload = require('../middleware/uploadGallery');

// Public route - get all active events (or all if admin)
router.get('/', optionalProtect, getEvents);

// Admin routes - protected
router.post('/', protect, restrictToAdmin, upload.single('image'), createEvent);
router.put(
  '/:id',
  protect,
  restrictToAdmin,
  upload.single('image'),
  updateEvent,
);
router.delete('/:id', protect, restrictToAdmin, deleteEvent);

module.exports = router;
