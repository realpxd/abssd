require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/database')

// Import routes
const contactRoutes = require('./routes/contactRoutes')
const galleryRoutes = require('./routes/galleryRoutes')
const eventRoutes = require('./routes/eventRoutes')
const authRoutes = require('./routes/authRoutes')
const paymentRoutes = require('./routes/paymentRoutes')

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/events', eventRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
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
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app

