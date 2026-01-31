const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  webhookHandler,
  getPaymentStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Create order doesn't require auth (used during registration)
router.post('/create-order', createOrder);
// Verify payment - can work without auth if email is provided (for registration flow)
router.post('/verify', verifyPayment);
// Webhook endpoint - use raw body for signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler,
);

// Status check for client polling
router.get('/status/:orderId', getPaymentStatus);

module.exports = router;
