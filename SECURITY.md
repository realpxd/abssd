# Security Documentation

This document outlines the comprehensive security measures implemented to protect against various types of attacks.

## 🛡️ Security Features Overview

### 1. **DDoS Protection**

#### Rate Limiting

Multiple layers of rate limiting protect against Distributed Denial of Service (DDoS) attacks:

- **General API Rate Limiter**: 100 requests per 15 minutes per IP
- **Authentication Routes**: 5 requests per 15 minutes (login, register, password reset)
- **Payment Routes**: 10 requests per hour
- **Contact Form**: 3 requests per hour
- **File Uploads**: 20 uploads per hour

#### Suspicious Activity Detection

- Monitors request patterns from individual IPs
- Blocks IPs making more than 200 requests per minute
- Automatic cleanup of tracking data
- Logs suspicious activity for review

#### Request Size Limits

- General requests: 1MB maximum
- File uploads: 10MB maximum
- Prevents memory exhaustion attacks

### 2. **Script Injection Protection**

#### XSS (Cross-Site Scripting) Prevention

**Backend:**

- Custom XSS protection middleware removes dangerous patterns
- Strips `<script>`, `<iframe>`, `<object>`, `<embed>` tags
- Removes `javascript:` protocols and event handlers (`onclick`, etc.)
- Sanitizes all request body, query, and parameter data

**Frontend:**

- DOMPurify library for HTML sanitization
- Input validation and sanitization utilities
- Content Security Policy (CSP) headers
- Safe HTML rendering in React components

#### SQL/NoSQL Injection Prevention

- `express-mongo-sanitize`: Prevents MongoDB operator injection
- Replaces dangerous characters in queries
- Custom SQL injection pattern detection
- Mongoose schema validation
- Parameterized queries only

#### Command Injection Protection

- No direct shell command execution from user input
- Input validation on all file operations
- Whitelist-based file type validation

### 3. **HTTP Security Headers**

Implemented via Helmet.js:

```javascript
Content-Security-Policy
X-DNS-Prefetch-Control
X-Frame-Options: DENY
Strict-Transport-Security
X-Download-Options
X-Content-Type-Options
X-XSS-Protection
```

### 4. **Authentication & Authorization Security**

#### Password Security

- bcrypt hashing with salt rounds
- Minimum password complexity requirements
- Secure password reset with time-limited tokens
- Account lockout after failed attempts (via rate limiting)

#### JWT Token Security

- Secure token generation and validation
- Token expiration enforcement
- HttpOnly cookies (where applicable)
- Token refresh mechanism

#### Session Management

- Secure session handling
- Automatic session timeout
- Protection against session fixation

### 5. **File Upload Security**

#### Validation

- File type whitelisting (images only: jpg, png, gif, webp)
- File size limits (10MB max)
- MIME type verification
- Extension validation
- Upload rate limiting (20 per hour)

#### Storage Security

- Files stored outside web root
- Randomized filenames
- Metadata sanitization
- Secure file serving with proper headers

### 6. **CORS (Cross-Origin Resource Sharing)**

- Whitelist-based origin validation
- Credentials allowed only for trusted origins
- Method restrictions (GET, POST, PUT, DELETE, OPTIONS, PATCH)
- Header restrictions

### 7. **HTTP Parameter Pollution (HPP) Prevention**

- Prevents duplicate parameter attacks
- Whitelist for legitimate array parameters
- Protects against parameter override attacks

### 8. **Data Protection**

#### Input Validation

- All user inputs validated and sanitized
- Type checking and format validation
- Email, URL, phone number validation
- Prevention of prototype pollution

#### Output Encoding

- HTML entity encoding
- JSON serialization safety
- URL encoding where needed

#### Database Security

- Connection string in environment variables
- Encrypted connections (if available)
- Principle of least privilege for database user
- Regular backups

### 9. **Error Handling**

- Secure error messages (no sensitive data leakage)
- Different error responses for dev vs production
- Comprehensive error logging
- Stack traces hidden in production

### 10. **Logging & Monitoring**

- Request logging with sanitized data
- Error logging with context
- Security event logging
- Rate limit violation logging
- Suspicious activity alerts

## 🔧 Implementation Guide

### Backend Security Setup

All security middleware is automatically loaded in `server.js`:

```javascript
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
```

### Frontend Security Usage

Import security utilities:

```javascript
import {
  sanitizeHtml,
  sanitizeText,
  validateEmail,
  validatePhone,
  validateFileUpload,
  ClientRateLimiter,
  secureStorage,
} from '../utils/security';
```

Example usage:

```javascript
// Sanitize user input
const cleanInput = sanitizeText(userInput);

// Validate email
const { isValid, sanitized } = validateEmail(email);

// Validate file upload
const { isValid, error } = validateFileUpload(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png'],
});

// Client-side rate limiting
const limiter = new ClientRateLimiter(5, 60000); // 5 requests per minute
if (limiter.canMakeRequest()) {
  // Make API call
}

// Secure storage
secureStorage.setItem('userData', { name: 'John' });
const data = secureStorage.getItem('userData');
```

## 🚨 Attack Scenarios & Mitigations

### DDoS Attack

**Attack**: Overwhelm server with requests
**Mitigation**:

- Rate limiting at multiple levels
- Suspicious activity detection
- Request size limits
- IP-based blocking

### XSS Attack

**Attack**: Inject malicious scripts via input fields
**Mitigation**:

- Input sanitization on backend
- DOMPurify on frontend
- CSP headers
- React's built-in XSS protection

### SQL/NoSQL Injection

**Attack**: Manipulate database queries
**Mitigation**:

- MongoDB sanitization
- Mongoose schema validation
- No raw query execution
- Pattern detection

### Brute Force Attack

**Attack**: Repeated login attempts
**Mitigation**:

- Strict rate limiting (5 attempts per 15 min)
- Account lockout
- Strong password requirements
- Logging of failed attempts

### File Upload Attack

**Attack**: Upload malicious files
**Mitigation**:

- File type whitelisting
- Size limits
- Extension validation
- MIME type checking
- Upload rate limiting

### CSRF Attack

**Attack**: Forge requests from authenticated users
**Mitigation**:

- CSRF tokens (implemented)
- SameSite cookies
- Origin validation
- Custom headers

### Prototype Pollution

**Attack**: Modify JavaScript object prototypes
**Mitigation**:

- Input sanitization
- Object key validation
- HPP prevention
- Safe object creation

## 📊 Security Checklist

- [x] DDoS protection via rate limiting
- [x] XSS prevention (backend + frontend)
- [x] SQL/NoSQL injection prevention
- [x] CSRF protection
- [x] Secure HTTP headers (Helmet)
- [x] Input validation and sanitization
- [x] File upload security
- [x] CORS configuration
- [x] Password hashing (bcrypt)
- [x] JWT token security
- [x] Error handling (no data leakage)
- [x] Request size limits
- [x] Suspicious activity detection
- [x] Logging and monitoring
- [x] HPP prevention
- [x] Prototype pollution prevention

## 🔐 Environment Variables

Ensure these are set securely:

```env
JWT_SECRET=<strong-random-secret>
MONGODB_URI=<encrypted-connection-string>
NODE_ENV=production
FRONTEND_URL=<your-frontend-url>
```

## 📝 Best Practices

1. **Keep Dependencies Updated**

   ```bash
   npm audit
   npm audit fix
   ```

2. **Regular Security Audits**
   - Review logs for suspicious activity
   - Monitor rate limit violations
   - Check for unauthorized access attempts

3. **Environment Security**
   - Never commit `.env` files
   - Use environment-specific configurations
   - Rotate secrets regularly

4. **Code Review**
   - Review all user input handling
   - Check for SQL/NoSQL injection vectors
   - Verify authentication/authorization

5. **HTTPS Only**
   - Use SSL/TLS certificates
   - Redirect HTTP to HTTPS
   - Enable HSTS headers

## 🆘 Incident Response

If you detect a security incident:

1. **Immediately**:
   - Block the attacking IP
   - Review recent logs
   - Check for data breaches

2. **Investigate**:
   - Identify attack vector
   - Assess damage
   - Document findings

3. **Remediate**:
   - Patch vulnerabilities
   - Update security measures
   - Notify affected users if needed

4. **Prevent**:
   - Implement additional protections
   - Update documentation
   - Train team members

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)

## 🔄 Security Updates

This document should be updated whenever:

- New security features are added
- Vulnerabilities are discovered and fixed
- Dependencies are updated
- Attack patterns change

Last Updated: February 1, 2026
