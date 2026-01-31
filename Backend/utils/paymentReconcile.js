const PaymentAttempt = require('../models/PaymentAttempt');
const User = require('../models/User');
const logger = require('../utils/logger');
const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const razorpay =
  keyId && keySecret
    ? new Razorpay({ key_id: keyId, key_secret: keySecret })
    : null;

const reconcileOnce = async () => {
  if (!razorpay) return;
  try {
    const threshold = new Date(Date.now() - 1000 * 60 * 5); // attempts older than 5 minutes
    const attempts = await PaymentAttempt.find({
      status: { $in: ['created', 'pending'] },
      createdAt: { $lte: threshold },
    }).limit(50);
    for (const a of attempts) {
      try {
        const paymentsResp = await razorpay.orders.fetchPayments(a.orderId);
        const payments = paymentsResp.items || [];
        const captured = payments.find((p) => p.status === 'captured');
        if (captured) {
          a.paymentId = captured.id;
          a.status = 'captured';
          a.meta = a.meta || {};
          a.meta.reconciled = true;
          a.meta.payload = captured;
          await a.save();

          // Try to finalize membership by finding user by email
          const email = captured.email;
          if (email) {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (user && user.membershipStatus !== 'active') {
              const startDate = new Date();
              const endDate = new Date();
              const membership =
                a.membershipType || user.membershipType || 'ordinary';
              if (membership === 'annual')
                endDate.setFullYear(endDate.getFullYear() + 1);
              else endDate.setFullYear(endDate.getFullYear() + 100);
              await User.findByIdAndUpdate(user._id, {
                membershipStatus: 'active',
                paymentId: captured.id,
                membershipType: membership,
                membershipAmount:
                  captured.amount / 100 || user.membershipAmount,
                membershipStartDate: startDate,
                membershipEndDate: endDate,
              });
              try {
                const mailer = require('../utils/mailer');
                const subject = 'ABSSD Trust - Membership activated';
                const html = `<p>Dear ${user.username || ''},</p><p>Your membership has been activated. Membership type: <strong>${membership}</strong>.</p>`;
                await mailer.sendMail({ to: user.email, subject, html });
              } catch (mailErr) {
                logger.warn(
                  'Failed to send activation email during reconcile:',
                  mailErr,
                );
              }
            }
          }
        }
      } catch (err) {
        logger.warn('Failed to reconcile attempt', a.orderId, err.message);
      }
    }
  } catch (err) {
    logger.error('Reconcile job failed:', err);
  }
};

let intervalId = null;
exports.start = (opts = {}) => {
  const everyMs = opts.everyMs || 1000 * 60 * 5; // default every 5 minutes
  if (!razorpay) {
    logger.warn('Razorpay not configured - reconcile disabled');
    return;
  }
  if (intervalId) return;
  intervalId = setInterval(reconcileOnce, everyMs);
  // Run immediately once
  reconcileOnce().catch((err) => logger.warn('Initial reconcile failed', err));
  logger.info('Payment reconcile started, interval ms=', everyMs);
};

exports.stop = () => {
  if (intervalId) clearInterval(intervalId);
};
