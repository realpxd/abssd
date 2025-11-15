const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected')
      return mongoose.connection
    }

    // Remove deprecated options - they're not needed in Mongoose 6+
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/abssd')

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`)
    // Don't exit process in serverless environments (like Vercel)
    // Let the error be handled by the route handlers
    throw error
  }
}

module.exports = connectDB

