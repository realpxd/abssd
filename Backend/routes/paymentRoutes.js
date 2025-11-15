const express = require('express')
const router = express.Router()
const { createOrder, verifyPayment } = require('../controllers/paymentController')
const { protect } = require('../middleware/auth')

// Create order doesn't require auth (used during registration)
router.post('/create-order', createOrder)
// Verify payment - can work without auth if email is provided (for registration flow)
router.post('/verify', verifyPayment)

module.exports = router

