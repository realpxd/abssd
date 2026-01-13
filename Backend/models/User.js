const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    contactNo: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    
    // Personal Details
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
    fatherName: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    aadharNo: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allow null values but enforce uniqueness for non-null
    },
    qualification: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    moreDetails: {
      type: String,
      trim: true,
    },
    photo: {
      type: String, // URL or path to photo
    },
    
    // Membership
    membershipStatus: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled'],
      default: 'pending',
    },
    membershipType: {
      type: String,
      enum: ['annual', 'lifetime'],
    },
    membershipAmount: {
      type: Number,
    },
    paymentId: {
      type: String, // Razorpay payment ID
    },
    membershipStartDate: {
      type: Date,
    },
    membershipEndDate: {
      type: Date,
    },
    
    // Account Status
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Sequential member number (1, 2, 3 ...). Assigned at registration.
    memberNumber: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Generate JWT token
userSchema.methods.generateToken = function () {
  const jwt = require('jsonwebtoken')
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Please set it in environment variables.')
  }
  return jwt.sign({ id: this._id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  })
}

module.exports = mongoose.model('User', userSchema)

