const Contact = require('../models/Contact')
const { getPaginationParams, getPaginationResponse } = require('../utils/pagination')
const mailer = require('../utils/mailer')

// Create new contact
exports.createContact = async (req, res) => {
  try {
    // Basic input sanitization
    const { name, email, phone, message } = req.body
    
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      })
    }
    
    const contact = await Contact.create({ name, email, phone, message })

    // Send notification to admin email (best-effort)
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
      if (adminEmail) {
        const subject = `New contact form submission from ${name}`
        const html = `<p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong><br/>${(message || '').replace(/\n/g, '<br/>')}</p>`
        await mailer.sendMail({ to: adminEmail, subject, html })
      }
    } catch (mailErr) {
      // non-fatal
      console.warn('Failed to send contact notification email:', mailErr)
    }
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact form submitted successfully',
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating contact',
    })
  }
}

// Get all contacts (admin)
exports.getAllContacts = async (req, res) => {
  try {
    // Get pagination parameters
    const { page, limit, skip } = getPaginationParams(req)
    
    // Get total count and paginated results
    const [contacts, total] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(),
    ])
    
    res.status(200).json(getPaginationResponse(page, limit, total, contacts))
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contacts',
    })
  }
}

// Get single contact
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      })
    }
    res.status(200).json({
      success: true,
      data: contact,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contact',
    })
  }
}

