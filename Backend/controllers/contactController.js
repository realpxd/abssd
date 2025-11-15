const Contact = require('../models/Contact')
const { getPaginationParams, getPaginationResponse } = require('../utils/pagination')

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

