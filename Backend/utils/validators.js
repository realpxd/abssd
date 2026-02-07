/**
 * Backend validation utilities
 * Mirrors frontend security validations for consistency
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};

/**
 * Validate Indian phone number format
 * @param {string} phone - Phone to validate
 * @returns {boolean} - True if valid phone
 */
const isValidPhone = (phone) => {
  if (typeof phone !== 'string') return false;
  const sanitized = phone.trim().replace(/\s+/g, '');
  // Indian phone: 10 digits, optionally starting with +91 or 91
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(sanitized);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
const isValidUrl = (url) => {
  if (typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential HTML characters
    .substring(0, 10000); // Cap at 10k chars
};

/**
 * Prevent prototype pollution attacks
 * @param {object} obj - Object to check
 * @returns {boolean} - True if safe
 */
const isSafeObject = (obj) => {
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

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeString,
  isSafeObject,
};
