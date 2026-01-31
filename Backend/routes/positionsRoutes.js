const express = require('express');
const router = express.Router();
const { protect, restrictToAdmin } = require('../middleware/auth');
const {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
} = require('../controllers/positionsController');

// Public: list positions
router.get('/', getPositions);

// Admin: create/update/delete positions
router.post('/', protect, restrictToAdmin, createPosition);
router.put('/:id', protect, restrictToAdmin, updatePosition);
router.delete('/:id', protect, restrictToAdmin, deletePosition);

module.exports = router;
