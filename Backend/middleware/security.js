const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');

// Rate limiting to prevent DDoS and brute force attacks
const createRateLimiter = (
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests from this IP, please try again later.',
) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health check endpoints
      if (req.path === '/health' || req.path === '/api/health') return true;
      // Skip rate limiting for admin users
      if (req.user && req.user.isAdmin) return true;
      // Skip rate limiting for admin routes
      if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin'))
        return true;
      return false;
    },
  });
};

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100);

// Strict limiter for authentication routes - 5 requests per 15 minutes
const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many authentication attempts, please try again after 15 minutes.',
);

// Payment route limiter - 10 requests per hour
const paymentLimiter = createRateLimiter(
  60 * 60 * 1000,
  10,
  'Too many payment requests, please try again later.',
);

// Contact form limiter - 3 requests per hour
const contactLimiter = createRateLimiter(
  60 * 60 * 1000,
  3,
  'Too many contact form submissions, please try again later.',
);

// File upload limiter - 20 uploads per hour
const uploadLimiter = createRateLimiter(
  60 * 60 * 1000,
  20,
  'Too many upload requests, please try again later.',
);

// Configure Helmet for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.razorpay.com'],
      frameSrc: ["'self'", 'https://api.razorpay.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
});

// MongoDB injection prevention - Custom implementation to avoid req.query read-only issue
const mongoSanitizeConfig = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {};
    for (let key in obj) {
      // Only sanitize keys that contain dangerous patterns, not values
      if (key.includes('$') || key.includes('.')) {
        console.warn(
          `Potential NoSQL injection attempt detected in key: ${key}`,
        );
        const safeKey = key.replace(/\$/g, '_').replace(/\./g, '_');
        sanitized[safeKey] =
          typeof obj[key] === 'object' ? sanitizeObject(obj[key]) : obj[key];
      } else {
        // Keep keys as-is, and recursively sanitize nested objects
        sanitized[key] =
          typeof obj[key] === 'object' && obj[key] !== null
            ? sanitizeObject(obj[key])
            : obj[key];
      }
    }
    return sanitized;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// HTTP Parameter Pollution prevention
const hppConfig = hpp({
  whitelist: ['category', 'membershipType', 'membershipStatus'], // Allow these params to appear multiple times
});

// Custom XSS protection middleware (since xss-clean is deprecated)
const xssProtection = (req, res, next) => {
  const cleanString = (str) => {
    if (typeof str !== 'string') return str;

    // Remove potential XSS patterns
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  };

  const cleanObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = cleanString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        obj[key] = cleanObject(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) req.body = cleanObject(req.body);
  if (req.query) req.query = cleanObject(req.query);
  if (req.params) req.params = cleanObject(req.params);

  next();
};

// Request size limiter to prevent large payload attacks
const requestSizeLimiter = (req, res, next) => {
  const contentLength = req.headers['content-length'];

  // List of endpoints that allow larger file uploads
  const fileUploadEndpoints = [
    '/upload',
    '/gallery',
    '/register', // Registration with Aadhaar & photo files
    '/auth/register', // Alternative registration path
    '/profile', // Profile updates with photo
  ];

  // Check if current path is a file upload endpoint
  const isFileUploadPath = fileUploadEndpoints.some((endpoint) =>
    req.path.includes(endpoint),
  );

  const maxSize = isFileUploadPath
    ? 50 * 1024 * 1024 // 50MB for file uploads (increased from 10MB)
    : 1 * 1024 * 1024; // 1MB for regular requests

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      error: 'Request payload too large',
      maxSize: `${maxSize / (1024 * 1024)}MB`,
      received: `${parseInt(contentLength) / (1024 * 1024)}MB`,
    });
  }
  next();
};

// IP-based request tracking to detect suspicious activity
const suspiciousActivityDetector = (() => {
  const ipRequests = new Map();
  const WINDOW = 60000; // 1 minute
  const THRESHOLD = 200; // Max requests per minute

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, []);
    }

    const requests = ipRequests.get(ip);
    // Remove old requests outside the window
    const recentRequests = requests.filter((time) => now - time < WINDOW);
    recentRequests.push(now);
    ipRequests.set(ip, recentRequests);

    if (recentRequests.length > THRESHOLD) {
      console.warn(
        `Suspicious activity detected from IP: ${ip} - ${recentRequests.length} requests in 1 minute`,
      );
      return res.status(429).json({
        error:
          'Too many requests. Your IP has been temporarily blocked due to suspicious activity.',
      });
    }

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      for (let [key, value] of ipRequests.entries()) {
        if (value.every((time) => now - time > WINDOW * 10)) {
          ipRequests.delete(key);
        }
      }
    }

    next();
  };
})();

// SQL Injection prevention (though we use MongoDB)
const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|\;|\/\*|\*\/|xp_|sp_)/gi,
  ];

  const checkForSQLInjection = (value) => {
    if (typeof value !== 'string') return false;
    return sqlPatterns.some((pattern) => pattern.test(value));
  };

  const scanObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string' && checkForSQLInjection(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object') {
        if (scanObject(obj[key])) return true;
      }
    }
    return false;
  };

  if (scanObject(req.body) || scanObject(req.query) || scanObject(req.params)) {
    console.warn('Potential SQL injection attempt detected');
    return res.status(400).json({ error: 'Invalid request data' });
  }

  next();
};

module.exports = {
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
};
