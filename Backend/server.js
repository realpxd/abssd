require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/database')
const ensureDBConnection = require('./middleware/dbConnection')
const logger = require('./utils/logger')

// Import routes
const contactRoutes = require('./routes/contactRoutes')
const galleryRoutes = require('./routes/galleryRoutes')
const eventRoutes = require('./routes/eventRoutes')
const authRoutes = require('./routes/authRoutes')
const geoRoutes = require('./routes/geoRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const positionsRoutes = require('./routes/positionsRoutes')

const app = express()

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET']
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
  logger.warn(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
  logger.warn('Some features may not work correctly. Please check your .env file.')
}

// Connect to database (async, don't block server startup)
// In serverless, connection will be established on first request via middleware
if (!process.env.VERCEL) {
  connectDB().catch((error) => {
    logger.error('Database connection error:', error)
  })
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'https://abssd.vercel.app',
      'https://abssd-fe.vercel.app',
      'https://abssd.in',
      'https://www.abssd.in',
      /\.vercel\.app$/, // Allow all Vercel preview deployments
    ].filter(Boolean)
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin)
      }
      return false
    })
    
    // In production/Vercel, be more permissive if FRONTEND_URL is not set
    if (isAllowed || !process.env.FRONTEND_URL || process.env.VERCEL) {
      callback(null, true)
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// Ensure database connection before API routes (except health check)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next()
  }
  return ensureDBConnection(req, res, next)
})

// Serve static files (uploads) - with security headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true,
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/geo', geoRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/positions', positionsRoutes)
app.use(
  "/api/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);


// Health check (doesn't require DB connection)
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose')
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
    })
  } catch (error) {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: 'error',
      warning: error.message,
    })
  }
})

// 404 handler - catch all routes that don't match above
// In Express 5, use middleware without path to catch unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  })
})

// Error handler
app.use((err, req, res, next) => {
  // Log error
  logger.error('Request error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    url: req.originalUrl,
  })

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    })
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.name,
    }),
  })
})

// Only start server if not in Vercel serverless environment
// Vercel will handle the serverless function invocation
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

module.exports = app

