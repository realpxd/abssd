const Event = require('../models/Event')
const path = require('path')
const fs = require('fs')

// Get all events (public - only active)
// Get all events (admin - all items)
exports.getEvents = async (req, res) => {
  try {
    // Check if user is admin (optional - req.user might not exist for public access)
    const isAdmin = req.user && req.user.role === 'admin'
    const query = isAdmin ? {} : { isActive: true }
    const events = await Event.find(query).sort({ date: -1 })
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching events',
    })
  }
}

// Create event (admin)
exports.createEvent = async (req, res) => {
  try {
    const data = { ...req.body }
    
    // Handle file upload (priority over imageUrl in body)
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`
    }
    // imageUrl is optional for events
    
    const event = await Event.create(data)
    res.status(201).json({
      success: true,
      data: event,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating event',
    })
  }
}

// Update event (admin)
exports.updateEvent = async (req, res) => {
  try {
    const data = { ...req.body }
    
    // Handle file upload (priority over imageUrl in body)
    if (req.file) {
      // Delete old file if exists
      const oldEvent = await Event.findById(req.params.id)
      if (oldEvent && oldEvent.imageUrl && oldEvent.imageUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', oldEvent.imageUrl)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }
      data.imageUrl = `/uploads/${req.file.filename}`
    }
    // If no file uploaded, use imageUrl from body (if provided)
    
    const event = await Event.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    })
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      })
    }
    res.status(200).json({
      success: true,
      data: event,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating event',
    })
  }
}

// Delete event (admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      })
    }
    
    // Delete associated file
    if (event.imageUrl && event.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', event.imageUrl)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    
    await Event.findByIdAndDelete(req.params.id)
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting event',
    })
  }
}

