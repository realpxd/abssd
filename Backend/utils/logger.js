/**
 * Simple logger utility for consistent logging
 * In production, consider using winston or pino
 */

const logger = {
  info: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args)
    }
  },
  
  error: (message, error, ...args) => {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, errorDetails, ...args)
  },
  
  warn: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args)
    }
  },
  
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args)
    }
  },
}

module.exports = logger

