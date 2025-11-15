const mongoose = require('mongoose')
const connectDB = require('../config/database')
const logger = require('../utils/logger')

/**
 * Middleware to ensure database connection before handling requests
 * Prevents "buffering timed out" errors in serverless environments
 */
const ensureDBConnection = async (req, res, next) => {
  try {
    // Skip for health check to avoid circular issues
    if (req.path === '/api/health') {
      return next()
    }

    // Check connection state
    const readyState = mongoose.connection.readyState
    
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (readyState === 0 || readyState === 3) {
      // Not connected or disconnecting - establish connection
      await connectDB()
    } else if (readyState === 2) {
      // Currently connecting - wait for connection
      // Wait up to 5 seconds for connection
      let attempts = 0
      while (mongoose.connection.readyState !== 1 && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection timeout')
      }
    }
    
    // Connection is ready (readyState === 1)
    next()
  } catch (error) {
    logger.error('Database connection middleware error:', error)
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = ensureDBConnection

