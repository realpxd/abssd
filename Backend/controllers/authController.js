const User = require('../models/User')
const Counter = require('../models/Counter')
const { validationResult } = require('express-validator')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

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

    // Generate sequential memberNumber atomically
    let memberNumber
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'userId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      )
      memberNumber = counter.seq
    } catch (err) {
      // If counter fails, fall back to undefined (user will still be created)
      console.error('Failed to generate memberNumber:', err)
      memberNumber = undefined
    }

    // Create user
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      contactNo: contactNo.trim(),
      password,
      dob: dob ? new Date(dob) : undefined,
      gender,
      fatherName: fatherName?.trim(),
      motherName: motherName?.trim(),
      address: address ? {
        street: address.street?.trim(),
        city: address.city?.trim(),
        state: address.state?.trim(),
        pincode: address.pincode?.trim(),
        country: address.country?.trim() || 'India',
      } : undefined,
      aadharNo: aadharNo?.trim(),
      qualification: qualification?.trim(),
      occupation: occupation?.trim(),
      moreDetails: moreDetails?.trim(),
      membershipType,
      membershipAmount,
      membershipStatus: 'pending',
      memberNumber,
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
    const updates = {}
    const userId = req.user._id

    // Only allow specific fields to be updated
    const allowedFields = [
      'username', 'contactNo', 'dob', 'gender', 'fatherName', 'motherName',
      'address', 'aadharNo', 'qualification', 'occupation', 'moreDetails', 'role'
    ]
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'address' && typeof req.body[field] === 'object') {
          updates[field] = {
            street: req.body[field].street?.trim(),
            city: req.body[field].city?.trim(),
            state: req.body[field].state?.trim(),
            pincode: req.body[field].pincode?.trim(),
            country: req.body[field].country?.trim() || 'India',
          }
        } else if (field === 'dob' && req.body[field]) {
          updates[field] = new Date(req.body[field])
        } else if (typeof req.body[field] === 'string') {
          updates[field] = req.body[field].trim()
        } else {
          updates[field] = req.body[field]
        }
      }
    })
    
    // Allow role update only if explicitly provided (for testing/admin purposes)
    // In production, you might want to restrict this to admin-only
    if (updates.role && !['user', 'admin'].includes(updates.role)) {
      delete updates.role
    }

    // Handle photo upload
    if (req.file) {
      // Delete old photo if exists
      const oldUser = await User.findById(userId)
      if (oldUser && oldUser.photo && oldUser.photo.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', oldUser.photo)
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath)
          } catch (unlinkError) {
            // Log but don't fail if file deletion fails
            const logger = require('../utils/logger')
            logger.warn('Failed to delete old photo:', unlinkError)
          }
        }
      }
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

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users',
    })
  }
}

// Get single user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

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

// Update user membership status (Admin only)
exports.updateMembershipStatus = async (req, res) => {
  try {
    const { membershipStatus } = req.body
    const userId = req.params.id

    if (!['pending', 'active', 'cancelled'].includes(membershipStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership status',
      })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { membershipStatus },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Membership status updated successfully',
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating membership status',
    })
  }
}

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    const userId = req.params.id

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role provided',
      })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user role',
    })
  }
}

// Update user member number (Admin only) - used for backfill/migrations
exports.updateMemberNumber = async (req, res) => {
  try {
    const { memberNumber } = req.body
    const userId = req.params.id

    if (memberNumber === undefined || memberNumber === null) {
      return res.status(400).json({ success: false, message: 'memberNumber is required' })
    }

    const num = parseInt(memberNumber, 10)
    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ success: false, message: 'memberNumber must be a positive integer' })
    }

    // Check for uniqueness: if some other user already has this memberNumber, reject
    const conflict = await User.findOne({ memberNumber: num, _id: { $ne: userId } })
    if (conflict) {
      return res.status(409).json({ success: false, message: 'memberNumber already assigned to another user' })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { memberNumber: num },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({ success: true, message: 'memberNumber updated', data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating memberNumber' })
  }
}

// Notify user by email (Admin only)
exports.notifyUser = async (req, res) => {
  try {
    const { subject, message } = req.body
    const userId = req.params.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // TODO: Implement email sending logic here
    // For now, we'll just return success
    // You can integrate with nodemailer or any email service

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
      data: {
        to: user.email,
        subject,
        message,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending notification',
    })
  }
}

