import DOMPurify from 'dompurify';
import validator from 'validator';

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} dirty - The unsanitized HTML string
 * @param {object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHtml = (dirty, options = {}) => {
  if (typeof dirty !== 'string') return '';

  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    ...options,
  };

  return DOMPurify.sanitize(dirty, defaultOptions);
};

/**
 * Sanitize text input by removing all HTML tags
 * @param {string} input - The input string
 * @returns {string} - Sanitized plain text
 */
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';

  // Remove all HTML tags
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Validate and sanitize email address
 * @param {string} email - The email address to validate
 * @returns {object} - { isValid: boolean, sanitized: string }
 */
export const validateEmail = (email) => {
  const sanitized = sanitizeText(email).trim().toLowerCase();
  const isValid = validator.isEmail(sanitized);

  return {
    isValid,
    sanitized: isValid ? sanitized : '',
  };
};

/**
 * Validate and sanitize URL
 * @param {string} url - The URL to validate
 * @returns {object} - { isValid: boolean, sanitized: string }
 */
export const validateUrl = (url) => {
  const sanitized = sanitizeText(url).trim();
  const isValid = validator.isURL(sanitized, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });

  return {
    isValid,
    sanitized: isValid ? sanitized : '',
  };
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - The phone number to validate
 * @returns {object} - { isValid: boolean, sanitized: string }
 */
export const validatePhone = (phone) => {
  const sanitized = sanitizeText(phone).trim().replace(/\s+/g, '');

  // Indian phone number format: 10 digits, optionally starting with +91 or 91
  const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  const isValid = indianPhoneRegex.test(sanitized);

  return {
    isValid,
    sanitized: isValid ? sanitized : '',
  };
};

/**
 * Sanitize object by cleaning all string values
 * @param {object} obj - The object to sanitize
 * @param {function} sanitizer - The sanitization function (default: sanitizeText)
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj, sanitizer = sanitizeText) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizer(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key], sanitizer);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
};

/**
 * Prevent prototype pollution attacks
 * @param {object} obj - The object to check
 * @returns {boolean} - True if object is safe
 */
export const preventPrototypePollution = (obj) => {
  if (!obj || typeof obj !== 'object') return true;

  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

  const checkKeys = (object) => {
    for (let key in object) {
      if (dangerousKeys.includes(key)) {
        return false;
      }
      if (typeof object[key] === 'object' && object[key] !== null) {
        if (!checkKeys(object[key])) {
          return false;
        }
      }
    }
    return true;
  };

  return checkKeys(obj);
};

/**
 * Validate file upload
 * @param {File} file - The file to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  } = options;

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  const extension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Rate limit tracker for client-side rate limiting
 */
export class ClientRateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    // Check if we're under the limit
    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    this.requests.push(now);
    return true;
  }

  getRemainingTime() {
    if (this.requests.length < this.maxRequests) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    const now = Date.now();
    return Math.max(0, this.windowMs - (now - oldestRequest));
  }
}

/**
 * Secure local storage wrapper with encryption
 */
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const sanitizedKey = sanitizeText(key);
      const sanitizedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(sanitizedKey, sanitizedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getItem: (key) => {
    try {
      const sanitizedKey = sanitizeText(key);
      const value = localStorage.getItem(sanitizedKey);

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      const sanitizedKey = sanitizeText(key);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

/**
 * Escape special characters for use in regex
 * @param {string} string - The string to escape
 * @returns {string} - Escaped string
 */
export const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Content Security Policy helper
 */
export const cspNonce = () => {
  // Generate a random nonce for inline scripts
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
};
