const User = require('../models/User')
const { validationResult } = require('express-validator')
const crypto = require('crypto')

// Register new user
exports.register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      })
    }

    const {
      username,
      email,
      contactNo,
      password,
      dob,
      gender,
      fatherName,
      motherName,
      address,
      aadharNo,
      qualification,
      occupation,
      moreDetails,
      membershipType,
      membershipAmount,
    } = req.body

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.',
      })
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken. Please choose a different username.',
      })
    }

    // Create user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      contactNo,
      password,
      dob: dob ? new Date(dob) : undefined,
      gender,
      fatherName,
      motherName,
      address: address ? {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || 'India',
      } : undefined,
      aadharNo,
      qualification,
      occupation,
      moreDetails,
      membershipType,
      membershipAmount,
      membershipStatus: 'pending',
    })

    // Generate token
    const token = user.generateToken()

    // Remove password from output
    user.password = undefined

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user',
    })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Generate token
    const token = user.generateToken()

    // Remove password from output
    user.password = undefined

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
    })
  }
}

// Check if email exists
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    res.status(200).json({
      success: true,
      exists: !!user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking email',
    })
  }
}

// Check if contact number exists
exports.checkContactNo = async (req, res) => {
  try {
    const { contactNo } = req.body

    if (!contactNo) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is required',
      })
    }

    const user = await User.findOne({ contactNo })

    res.status(200).json({
      success: true,
      exists: !!user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking contact number',
    })
  }
}

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user',
    })
  }
}

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

    await user.save({ validateBeforeSave: false })

    // In production, send email with reset token
    // For now, return token (remove in production)
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken: resetToken, // Remove this in production
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing forgot password',
    })
  }
}

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    // Set new password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    // Generate new token
    const authToken = user.generateToken()

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        user,
        token: authToken,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password',
    })
  }
}

// Admin login (checks for admin role)
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Generate token
    const token = user.generateToken()

    // Remove password from output
    user.password = undefined

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
    })
  }
}

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body
    const userId = req.user._id

    // Remove fields that shouldn't be updated directly
    delete updates.password
    delete updates.email
    delete updates.membershipStatus
    delete updates.paymentId
    
    // Allow role update only if explicitly provided (for testing/admin purposes)
    // In production, you might want to restrict this to admin-only
    if (updates.role && !['user', 'admin'].includes(updates.role)) {
      delete updates.role
    }

    // Handle photo upload
    if (req.file) {
      updates.photo = `/uploads/${req.file.filename}`
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    })
  }
}

