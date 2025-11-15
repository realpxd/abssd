const Razorpay = require('razorpay')
const User = require('../models/User')

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_1DP5mmOlF5G5ag_secret',
})

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { amount, membershipType } = req.body

    if (!amount || !membershipType) {
      return res.status(400).json({
        success: false,
        message: 'Amount and membership type are required',
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
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
      },
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)
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

    const crypto = require('crypto')
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_1DP5mmOlF5G5ag_secret')
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

    res.status(200).json({
      success: true,
      message: 'Payment verified and membership activated',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying payment',
    })
  }
}

