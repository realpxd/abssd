const Razorpay = require('razorpay');
const User = require('../models/User');
const logger = require('../utils/logger');
const PaymentAttempt = require('../models/PaymentAttempt');
const { isValidEmail } = require('../utils/validators');
const crypto = require('crypto');

// Initialize Razorpay
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn(
    'Razorpay credentials not configured. Payment features will not work.',
  );
}

const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

// Create order
exports.createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured',
      });
    }

    const { amount, membershipType, email, contactNo, name } = req.body;

    if (!amount || !membershipType) {
      return res.status(400).json({
        success: false,
        message: 'Amount and membership type are required',
      });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // Generate unique receipt ID (user might not be registered yet)
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: receiptId,
      notes: {
        membershipType: membershipType,
        timestamp: new Date().toISOString(),
        email: email || undefined,
        contactNo: contactNo || undefined,
        name: name || undefined,
      },
    };

    const order = await razorpay.orders.create(options);

    // Persist PaymentAttempt for reconciliation/webhook safety
    try {
      await PaymentAttempt.create({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: 'created',
        membershipType: membershipType,
        meta: {
          receipt: receiptId,
          notes: {
            email: email || undefined,
            contactNo: contactNo || undefined,
            name: name || undefined,
            membershipType: membershipType,
          },
        },
      });
    } catch (err) {
      logger.warn('Failed to persist PaymentAttempt:', err);
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: razorpayKeyId,
      },
    });
  } catch (error) {
    logger.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order',
    });
  }
};

// Verify payment - Optimized for performance
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      membershipType,
      membershipAmount,
    } = req.body;

    // 1. QUICK VALIDATION (before any DB queries)
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are required',
      });
    }

    if (!razorpayKeySecret) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured',
      });
    }

    // 2. SIGNATURE VERIFICATION (cryptographic operation, fast)
    const generated_signature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - invalid signature',
      });
    }

    // 3. DETERMINE USER LOOKUP
    let userId = req.user?._id;
    let lookupEmail = email ? email.toLowerCase().trim() : null;

    if (!userId && !lookupEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email or authentication required',
      });
    }

    // 4. PREPARE MEMBERSHIP DATES (no DB calls)
    const startDate = new Date();
    const endDate = new Date();
    const finalMembershipType = membershipType || 'ordinary';

    if (finalMembershipType === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 100);
    }

    // 5. PARALLEL OPERATIONS - Run independent DB operations together
    const [existingUser, paymentAttempt] = await Promise.all([
      // Find user by ID (if authenticated) or email (if registering)
      userId
        ? User.findById(userId).lean()
        : lookupEmail
          ? User.findOne({ email: lookupEmail }).lean()
          : null,

      // Find existing payment attempt in parallel
      PaymentAttempt.findOne({ orderId: razorpay_order_id }).lean(),
    ]);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 6. UPDATE OPERATIONS - Parallel updates (no need to wait for intermediate results)
    const updatePromises = [
      // Update user membership
      User.findByIdAndUpdate(
        existingUser._id,
        {
          membershipStatus: 'active',
          paymentId: razorpay_payment_id,
          membershipType: finalMembershipType,
          membershipAmount: membershipAmount || existingUser.membershipAmount,
          membershipStartDate: startDate,
          membershipEndDate: endDate,
        },
        { new: true, projection: { password: 0 } }, // Don't send password, don't fetch unused fields
      ).lean(),

      // Update or create PaymentAttempt (single atomic operation)
      PaymentAttempt.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          status: 'captured',
          updatedAt: new Date(),
        },
        { upsert: true, new: false }, // We don't need the result
      ).lean(),
    ];

    // Wait for both updates to complete
    const [updatedUser] = await Promise.all(updatePromises);

    // 7. SEND EMAIL ASYNCHRONOUSLY (non-blocking - fire and forget)
    // Email will be sent in background without blocking the response
    if (existingUser.email) {
      sendMembershipActivationEmail(
        existingUser.username || 'Member',
        existingUser.email,
        finalMembershipType,
        startDate,
        endDate,
      ).catch((err) =>
        logger.warn('Failed to send membership email (async):', err),
      );
    }

    // 8. RESPOND IMMEDIATELY (email is now async)
    res.status(200).json({
      success: true,
      message: 'Payment verified and membership activated',
      user: updatedUser
        ? {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            membershipStatus: updatedUser.membershipStatus,
            membershipType: updatedUser.membershipType,
            membershipStartDate: updatedUser.membershipStartDate,
            membershipEndDate: updatedUser.membershipEndDate,
          }
        : null,
    });
  } catch (error) {
    logger.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying payment',
    });
  }
};

// Helper function - Send membership email async (non-blocking)
async function sendMembershipActivationEmail(
  username,
  email,
  membershipType,
  startDate,
  endDate,
) {
  try {
    const mailer = require('../utils/mailer');
    const subject = 'ABSSD Trust - Membership activated';
    const html = `<p>Dear ${username || 'Member'},</p>
      <p>Your membership has been activated. Membership type: <strong>${membershipType}</strong>.</p>
      <p>Start Date: ${new Date(startDate).toLocaleDateString('en-IN')}</p>
      <p>End Date: ${new Date(endDate).toLocaleDateString('en-IN')}</p>
      <p>Thank you for joining ABSSD Trust.</p>`;
    await mailer.sendMail({ to: email, subject, html });
  } catch (err) {
    // Already logged by caller with "async" tag
    throw err;
  }
}

// Webhook handler for Razorpay events
exports.webhookHandler = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body; // raw body should be used; route should use express.raw

    if (!webhookSecret) {
      logger.warn('Razorpay webhook secret not configured');
      return res.status(200).send('ok');
    }

    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');
    if (signature !== expected) {
      logger.warn('Invalid razorpay webhook signature');
      return res.status(400).send('invalid signature');
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    if (event === 'payment.captured' || event === 'payment.authorized') {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const email = payment.email || (payment.notes && payment.notes.email);

      // Update or create PaymentAttempt
      let attempt = await PaymentAttempt.findOne({ orderId });
      if (!attempt) {
        attempt = await PaymentAttempt.create({
          orderId,
          paymentId,
          amount: payment.amount,
          currency: payment.currency,
          status: 'captured',
          meta: { payload: payment },
        });
      } else {
        attempt.paymentId = paymentId;
        attempt.status = 'captured';
        attempt.meta = attempt.meta || {};
        attempt.meta.payload = payment;
        await attempt.save();
      }

      // Finalize membership: find user by email if exists and activate
      try {
        if (email) {
          const user = await User.findOne({ email: email.toLowerCase() });
          if (user) {
            // Activate membership if not active
            if (user.membershipStatus !== 'active') {
              const startDate = new Date();
              const endDate = new Date();
              const membership =
                payment.notes && payment.notes.membershipType
                  ? payment.notes.membershipType
                  : user.membershipType || 'ordinary';
              if (membership === 'annual')
                endDate.setFullYear(endDate.getFullYear() + 1);
              else endDate.setFullYear(endDate.getFullYear() + 100);

              await User.findByIdAndUpdate(user._id, {
                membershipStatus: 'active',
                paymentId: paymentId,
                membershipType: membership,
                membershipAmount: payment.amount / 100 || user.membershipAmount,
                membershipStartDate: startDate,
                membershipEndDate: endDate,
              });

              // Send email
              try {
                const mailer = require('../utils/mailer');
                const subject = 'ABSSD Trust - Membership activated';
                const html = `<p>Dear ${user.username || ''},</p><p>Your membership has been activated. Membership type: <strong>${membership}</strong>.</p>`;
                await mailer.sendMail({ to: user.email, subject, html });
              } catch (mailErr) {
                logger.warn(
                  'Failed to send membership activation email (webhook):',
                  mailErr,
                );
              }
            }
          }
        }
      } catch (err) {
        logger.error('Failed to finalize membership in webhook:', err);
      }
    }

    res.status(200).send('ok');
  } catch (err) {
    logger.error('Razorpay webhook processing error:', err);
    res.status(500).send('error');
  }
};

// Check payment attempt status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId)
      return res
        .status(400)
        .json({ success: false, message: 'orderId required' });
    const attempt = await PaymentAttempt.findOne({ orderId });
    if (!attempt)
      return res.status(404).json({ success: false, message: 'Not found' });
    // Try to find a user associated with this payment (by paymentId)
    let user = null;
    try {
      if (attempt.paymentId) {
        user = await User.findOne({ paymentId: attempt.paymentId }).select(
          'username email contactNo membershipStatus isEmailVerified',
        );
      }
    } catch (err) {
      logger.warn('Failed to lookup user for payment status:', err);
    }

    // Extract fallback contact details from attempt.meta if present
    const fallback = {};
    try {
      if (attempt.meta) {
        // common places for stored info
        const m = attempt.meta;
        if (m.notes) {
          if (m.notes.email) fallback.email = m.notes.email;
          if (m.notes.contactNo) fallback.contactNo = m.notes.contactNo;
          if (m.notes.name) fallback.name = m.notes.name;
          if (m.notes.mobile) fallback.contactNo = m.notes.mobile;
        }
        // sometimes payload stored under meta.payload
        if (
          !fallback.email &&
          m.payload &&
          m.payload.customer &&
          m.payload.customer.email
        )
          fallback.email = m.payload.customer.email;
        if (
          !fallback.contactNo &&
          m.payload &&
          m.payload.customer &&
          m.payload.customer.contact
        )
          fallback.contactNo = m.payload.customer.contact;
        // older receipts
        if (!fallback.receipt && m.receipt) fallback.receipt = m.receipt;
      }
    } catch (err) {
      logger.warn(
        'Failed to extract fallback contact from PaymentAttempt.meta:',
        err,
      );
    }

    res.status(200).json({
      success: true,
      data: {
        status: attempt.status,
        paymentId: attempt.paymentId,
        amount: attempt.amount,
        user: user
          ? {
              username: user.username,
              email: user.email,
              contactNo: user.contactNo,
              membershipStatus: user.membershipStatus,
              isEmailVerified: user.isEmailVerified,
            }
          : null,
        fallback: Object.keys(fallback).length ? fallback : null,
      },
    });
  } catch (err) {
    logger.error('getPaymentStatus error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
