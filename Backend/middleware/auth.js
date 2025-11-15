const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Protect routes
exports.protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    })
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      })
    }
    const decoded = jwt.verify(token, secret)
    
    // Use select to avoid password field unless needed
    req.user = await User.findById(decoded.id).select('-password')
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      })
    }

    next()
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      })
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    })
  }
}

// Optional protect - doesn't fail if no token, but sets req.user if token is valid
exports.optionalProtect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      // Use select to avoid password field
      req.user = await User.findById(decoded.id).select('-password')
    } catch (error) {
      // Invalid token, but continue without req.user
      req.user = null
    }
  }

  next()
}

// Restrict to admin
exports.restrictToAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    })
  }
  next()
}

