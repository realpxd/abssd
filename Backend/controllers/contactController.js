const Contact = require('../models/Contact')

// Create new contact
exports.createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body)
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact form submitted successfully',
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating contact',
      error: error,
    })
  }
}

// Get all contacts (admin)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    })
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

