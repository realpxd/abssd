const mongoose = require('mongoose');

const paymentAttemptSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String },
  amount: { type: Number },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'pending', 'captured', 'failed', 'refunded'],
    default: 'created',
  },
  membershipType: { type: String },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

paymentAttemptSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PaymentAttempt', paymentAttemptSchema);
