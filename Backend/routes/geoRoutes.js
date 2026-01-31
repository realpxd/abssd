const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');

// GET /api/geo/states
router.get('/states', geoController.getStates);

// GET /api/geo/cities/:state
router.get('/cities/:state', geoController.getCitiesByState);

module.exports = router;
