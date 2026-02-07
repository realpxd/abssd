require('dotenv').config();
// Provide a global fallback for escapeRegExp in case some modules reference it
if (typeof global.escapeRegExp === 'undefined') {
  global.escapeRegExp = function (str = '') {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const ensureDBConnection = require('./middleware/dbConnection');
const logger = require('./utils/logger');

// Import security middleware
const {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  contactLimiter,
  uploadLimiter,
  helmetConfig,
  mongoSanitizeConfig,
  hppConfig,
  xssProtection,
  requestSizeLimiter,
  suspiciousActivityDetector,
  sqlInjectionProtection,
} = require('./middleware/security');

// Import routes
const contactRoutes = require('./routes/contactRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const geoRoutes = require('./routes/geoRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const positionsRoutes = require('./routes/positionsRoutes');

const app = express();

// Detect if running in a serverless environment. Default is long-lived server.
// Set SERVERLESS=true in environments like Vercel or other serverless hosts
// to opt out of starting long-lived processes such as the DB connect or reconciler.
const isServerless =
  process.env.SERVERLESS === 'true' || process.env.SERVERLESS === '1';

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);

if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
  logger.warn(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`,
  );
  logger.warn(
    'Some features may not work correctly. Please check your .env file.',
  );
}

// Connect to database (async, don't block server startup)
// In serverless, connection will be established on first request via middleware
if (!isServerless) {
  connectDB().catch((error) => {
    logger.error('Database connection error:', error);
  });
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'https://abssd.vercel.app',
      'https://abssd-fe.vercel.app',
      'https://abssd.in',
      'https://www.abssd.in',
      /\.vercel\.app$/, // Allow all Vercel preview deployments
    ].filter(Boolean);

    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    // In production/serverless environments, be more permissive if FRONTEND_URL is not set
    if (isAllowed || !process.env.FRONTEND_URL || isServerless) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 204,
};

// Apply security middleware FIRST (before any routes or parsers)
app.set('trust proxy', 1); // Trust first proxy (needed for rate limiting behind proxies)
app.use(helmetConfig); // Security headers
app.use(suspiciousActivityDetector); // Detect suspicious activity patterns
app.use(requestSizeLimiter); // Prevent large payload attacks
app.use(cookieParser()); // Parse cookies for CSRF

// CORS with security
app.use(cors(corsOptions));

// Body parsers with limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security sanitization middleware
app.use(mongoSanitizeConfig); // Prevent NoSQL injection
app.use(xssProtection); // Prevent XSS attacks
app.use(sqlInjectionProtection); // Prevent SQL injection (defense in depth)
app.use(hppConfig); // Prevent HTTP Parameter Pollution

// Apply general API rate limiting
app.use('/api', apiLimiter);

// Ensure database connection before API routes (except health check)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  return ensureDBConnection(req, res, next);
});

// Serve static files (uploads) - with security headers
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1y', // Cache for 1 year
    etag: true,
    lastModified: true,
  }),
);

// Routes with specific rate limiters
app.use('/api/auth/login', authLimiter); // Strict rate limiting for login
app.use('/api/auth/register', authLimiter); // Strict rate limiting for registration
app.use('/api/auth/forgot-password', authLimiter); // Strict rate limiting for password reset
app.use('/api/auth/reset-password', authLimiter); // Strict rate limiting for password reset
app.use('/api/payment', paymentLimiter); // Payment-specific rate limiting
app.use('/api/contact', contactLimiter); // Contact form rate limiting
app.use('/api/gallery', uploadLimiter); // Upload-specific rate limiting
app.use('/api/events', uploadLimiter); // Upload-specific rate limiting

app.use('/api/auth', authRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/positions', positionsRoutes);
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check (doesn't require DB connection)
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: 'error',
      warning: error.message,
    });
  }
});

// 404 handler - catch all routes that don't match above
// In Express 5, use middleware without path to catch unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  // Log error
  logger.error('Request error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    url: req.originalUrl,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err.name,
    }),
  });
});

// Only start server if not running in a serverless environment
// Serverless platforms should invoke the exported app instead of starting a listener.
if (!isServerless) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Start payment reconcile job when running in long-lived server
try {
  if (!isServerless) {
    const reconciler = require('./utils/paymentReconcile');
    reconciler.start();
  }
} catch (err) {
  logger.warn('Failed to start payment reconciler:', err);
}

module.exports = app;
