const Razorpay = require('razorpay')
const User = require('../models/User')
const logger = require('../utils/logger')

// Initialize Razorpay
const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn('Razorpay credentials not configured. Payment features will not work.')
}

const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null

// Create order
exports.createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured',
      })
    }

    const { amount, membershipType } = req.body

    if (!amount || !membershipType) {
      return res.status(400).json({
        success: false,
        message: 'Amount and membership type are required',
      })
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      })
    }

    // Generate unique receipt ID (user might not be registered yet)
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: receiptId,
      notes: {
        membershipType: membershipType,
        timestamp: new Date().toISOString(),
      },
    }

    const order = await razorpay.orders.create(options)

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: razorpayKeyId,
      },
    })
  } catch (error) {
    logger.error('Razorpay order creation error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order',
    })
  }
}

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, membershipType, membershipAmount } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are required',
      })
    }

    if (!razorpayKeySecret) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured',
      })
    }

    const crypto = require('crypto')
    const generated_signature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - invalid signature',
      })
    }

    // Payment verified - find user by email or userId
    let user
    if (req.user) {
      // User is authenticated
      user = await User.findById(req.user._id)
    } else if (email) {
      // User not authenticated yet (registration flow) - find by email
      user = await User.findOne({ email: email.toLowerCase() })
    } else {
      return res.status(400).json({
        success: false,
        message: 'User email or authentication required',
      })
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Calculate membership dates
    const startDate = new Date()
    const endDate = new Date()
    const membership = membershipType || user.membershipType
    if (membership === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      // Lifetime membership
      endDate.setFullYear(endDate.getFullYear() + 100)
    }

    // Update user membership
    await User.findByIdAndUpdate(user._id, {
      membershipStatus: 'active',
      paymentId: razorpay_payment_id,
      membershipType: membership || user.membershipType,
      membershipAmount: membershipAmount || user.membershipAmount,
      membershipStartDate: startDate,
      membershipEndDate: endDate,
    })

    // Get updated user
    const updatedUser = await User.findById(user._id)

    // Send membership activation email (best-effort)
    try {
      const mailer = require('../utils/mailer')
      const subject = 'ABSSD Trust - Membership activated'
      const html = `<p>Dear ${updatedUser.username || ''},</p>
        <p>Your membership has been activated. Membership type: <strong>${updatedUser.membershipType}</strong>.</p>
        <p>Start Date: ${new Date(updatedUser.membershipStartDate).toLocaleDateString('en-IN')}</p>
        <p>End Date: ${new Date(updatedUser.membershipEndDate).toLocaleDateString('en-IN')}</p>
        <p>Thank you for joining ABSSD Trust.</p>`
      await mailer.sendMail({ to: updatedUser.email, subject, html })
    } catch (mailErr) {
      logger.warn('Failed to send membership activation email:', mailErr)
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and membership activated',
      user: updatedUser,
    })
  } catch (error) {
    logger.error('Payment verification error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying payment',
    })
  }
}

