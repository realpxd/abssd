const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Position name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Position', positionSchema);
