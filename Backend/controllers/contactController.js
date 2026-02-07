const Contact = require('../models/Contact');
const {
  getPaginationParams,
  getPaginationResponse,
} = require('../utils/pagination');
const mailer = require('../utils/mailer');
const {
  isValidEmail,
  isValidPhone,
  sanitizeString,
} = require('../utils/validators');

// Store recent submissions for duplicate detection (in-memory, clears on restart)
const recentSubmissions = new Map();

// Cleanup old submissions every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [ip, submissions] of recentSubmissions.entries()) {
    const filtered = submissions.filter((s) => s.time > oneHourAgo);
    if (filtered.length === 0) {
      recentSubmissions.delete(ip);
    } else {
      recentSubmissions.set(ip, filtered);
    }
  }
}, 3600000);

// Create new contact
exports.createContact = async (req, res) => {
  try {
    // Basic input sanitization
    const { name, email, phone, message, website, honeypot } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message:
          'Contact validation failed: email: Please provide a valid email',
      });
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message:
          'Contact validation failed: phone: Please provide a valid phone number',
      });
    }

    // Sanitize string inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPhone = phone.replace(/\s+/g, '');
    const sanitizedMessage = sanitizeString(message);

    // 1. HONEYPOT CHECK - Bots fill hidden fields
    if (website || honeypot) {
      console.warn('Honeypot triggered - potential bot submission:', {
        ip: req.ip,
        email: sanitizedEmail,
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid submission detected',
      });
    }

    // 2. DUPLICATE DETECTION - Prevent same message from same IP
    const ip = req.ip || req.connection.remoteAddress;
    const submissionKey = `${sanitizedEmail}-${sanitizedMessage.substring(0, 100)}`;
    const recent = recentSubmissions.get(ip) || [];

    const isDuplicate = recent.some(
      (s) => s.key === submissionKey && Date.now() - s.time < 3600000, // Within last hour
    );

    if (isDuplicate) {
      console.warn('Duplicate submission detected:', {
        ip,
        email: sanitizedEmail,
      });
      return res.status(429).json({
        success: false,
        message:
          'You have already submitted this message recently. Please wait before submitting again.',
      });
    }

    // 3. SPAM CONTENT DETECTION - Check for spam patterns
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|jackpot)\b/gi,
      /\b(click here|buy now|limited time|act now)\b/gi,
      /\b(winner|prize|congratulations.*won)\b/gi,
      /(https?:\/\/[^\s]+){4,}/gi, // 4+ URLs in message
      /\$\$\$|💰|🤑/g, // Money symbols spam
    ];

    const combinedText =
      `${sanitizedName} ${sanitizedEmail} ${sanitizedMessage}`.toLowerCase();
    const spamScore = spamPatterns.reduce((score, pattern) => {
      return score + (pattern.test(combinedText) ? 1 : 0);
    }, 0);

    if (spamScore >= 2) {
      console.warn('Spam content detected:', {
        ip,
        email: sanitizedEmail,
        score: spamScore,
      });
      return res.status(400).json({
        success: false,
        message:
          'Your message appears to contain spam content. Please revise and try again.',
      });
    }

    // 4. EXCESSIVE CAPS CHECK
    const capsRatio =
      (sanitizedMessage.match(/[A-Z]/g) || []).length / sanitizedMessage.length;
    if (capsRatio > 0.5 && sanitizedMessage.length > 20) {
      console.warn('Excessive caps detected:', {
        ip,
        email: sanitizedEmail,
        ratio: capsRatio,
      });
      return res.status(400).json({
        success: false,
        message: 'Please avoid excessive use of capital letters.',
      });
    }

    // 5. MINIMUM MESSAGE LENGTH
    if (sanitizedMessage.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message is too short. Please provide more details.',
      });
    }

    // Store this submission for duplicate detection
    recent.push({ key: submissionKey, time: Date.now() });
    recentSubmissions.set(ip, recent.slice(-5)); // Keep last 5 submissions per IP

    const contact = await Contact.create({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      message: sanitizedMessage,
    });

    // Send notification to admin email (best-effort)
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      if (adminEmail) {
        const subject = `New contact form submission from ${sanitizedName}`;
        const html = `<p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <p><strong>Phone:</strong> ${sanitizedPhone}</p>
          <p><strong>Message:</strong><br/>${(sanitizedMessage || '').replace(/\n/g, '<br/>')}</p>`;
        await mailer.sendMail({ to: adminEmail, subject, html });
      }
    } catch (mailErr) {
      // non-fatal
      console.warn('Failed to send contact notification email:', mailErr);
    }
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact form submitted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating contact',
    });
  }
};

// Get all contacts (admin)
exports.getAllContacts = async (req, res) => {
  try {
    // Get pagination parameters
    const { page, limit, skip } = getPaginationParams(req);

    // Get total count and paginated results
    const [contacts, total] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(),
    ]);

    res.status(200).json(getPaginationResponse(page, limit, total, contacts));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contacts',
    });
  }
};

// Get single contact
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contact',
    });
  }
};
