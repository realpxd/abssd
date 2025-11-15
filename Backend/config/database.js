const mongoose = require('mongoose')

// Connection state management
let isConnecting = false
let connectionPromise = null

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection
    }

    // If already connecting, return the existing promise
    if (isConnecting && connectionPromise) {
      return connectionPromise
    }

    // Set connecting flag
    isConnecting = true

    // Create connection promise with optimized options
    connectionPromise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/abssd', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering; throw immediately if not connected
      bufferCommands: false, // Disable mongoose buffering
    })

    const conn = await connectionPromise

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    isConnecting = false
    return conn
  } catch (error) {
    isConnecting = false
    connectionPromise = null
    console.error(`MongoDB Connection Error: ${error.message}`)
    throw error
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB')
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('MongoDB connection closed through app termination')
  process.exit(0)
})

module.exports = connectDB

