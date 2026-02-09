const mongoose = require('mongoose');

const socialCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address/City is required'],
      trim: true,
    },
    generated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('SocialCard', socialCardSchema);
