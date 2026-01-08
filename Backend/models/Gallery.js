const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    titleEn: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['cleanliness', 'water-service', 'toilet-management', 'fair-service', 'ekadashi', 'environment', 'others'],
      default: 'cleanliness',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Gallery', gallerySchema)

