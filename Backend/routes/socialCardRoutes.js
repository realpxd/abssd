const express = require('express');
const router = express.Router();
const {
  createSocialCard,
  getAllSocialCards,
  getSocialCardById,
  deleteSocialCard,
  getSocialCardStats,
} = require('../controllers/socialCardController');
const { protect, restrictToAdmin } = require('../middleware/auth');

// Public route - anyone can create a social card
router.post('/', createSocialCard);

// Admin routes - protected
// Specific routes first, then parameterized routes
router.get('/stats', protect, restrictToAdmin, getSocialCardStats);
router.delete('/:id', protect, restrictToAdmin, deleteSocialCard);
router.get('/:id', protect, restrictToAdmin, getSocialCardById);
router.get('/', protect, restrictToAdmin, getAllSocialCards);

module.exports = router;
