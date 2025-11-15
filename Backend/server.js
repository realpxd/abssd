require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/database')
const ensureDBConnection = require('./middleware/dbConnection')

// Import routes
const contactRoutes = require('./routes/contactRoutes')
const galleryRoutes = require('./routes/galleryRoutes')
const eventRoutes = require('./routes/eventRoutes')
const authRoutes = require('./routes/authRoutes')
const paymentRoutes = require('./routes/paymentRoutes')

const app = express()

// Connect to database (async, don't block server startup)
// In serverless, connection will be established on first request via middleware
if (!process.env.VERCEL) {
  connectDB().catch((error) => {
    console.error('Database connection error:', error)
  })
}


app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Ensure database connection before API routes (except health check)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next()
  }
  return ensureDBConnection(req, res, next)
})

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/events', eventRoutes)

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
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
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
    console.log(`Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

module.exports = app

