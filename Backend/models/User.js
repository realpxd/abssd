const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
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
      enum: ['male', 'female', ''],
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
      required: [true, 'Photo is required'],
    },
    aadharFront: {
      type: String, // path to uploaded front image
    },
    aadharBack: {
      type: String, // path to uploaded back image
    },
    aadharVerified: {
      type: Boolean,
      default: false,
    },

    // Membership
    membershipStatus: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled'],
      default: 'pending',
    },
    membershipType: {
      type: String,
      enum: ['annual', 'ordinary', 'lifetime'],
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
    // Team / referral system
    isTeamLeader: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Assigned position (optional) - references Position collection
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
    },
    // Sequential member number (1, 2, 3 ...). Assigned at registration.
    memberNumber: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    // Track if physical ID card has been issued to member
    cardIssued: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function () {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not configured. Please set it in environment variables.',
    );
  }
  return jwt.sign({ id: this._id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = mongoose.model('User', userSchema);
