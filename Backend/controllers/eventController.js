const Event = require('../models/Event')
const path = require('path')
const fs = require('fs')
const { getPaginationParams, getPaginationResponse } = require('../utils/pagination')
const logger = require('../utils/logger')

// Get all events (public - only active)
// Get all events (admin - all items)
exports.getEvents = async (req, res) => {
  try {
    // Check if user is admin (optional - req.user might not exist for public access)
    const isAdmin = req.user && req.user.role === 'admin'
    const query = isAdmin ? {} : { isActive: true }
    
    // Get pagination parameters
    const { page, limit, skip } = getPaginationParams(req)
    
    // Get total count and paginated results
    const [events, total] = await Promise.all([
      Event.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      Event.countDocuments(query),
    ])
    
    res.status(200).json(getPaginationResponse(page, limit, total, events))
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
    const data = {
      title: req.body.title?.trim(),
      titleEn: req.body.titleEn?.trim(),
      description: req.body.description?.trim(),
      date: req.body.date ? new Date(req.body.date) : undefined,
      location: req.body.location?.trim(),
    }
    
    // Validate required fields
    if (!data.title || !data.description || !data.date) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and date are required',
      })
    }
    
    // Handle file upload (priority over imageUrl in body)
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`
    } else if (req.body.imageUrl) {
      data.imageUrl = req.body.imageUrl.trim()
    }
    
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
    const data = {}
    
    // Only update provided fields
    if (req.body.title !== undefined) data.title = req.body.title.trim()
    if (req.body.titleEn !== undefined) data.titleEn = req.body.titleEn.trim()
    if (req.body.description !== undefined) data.description = req.body.description.trim()
    if (req.body.date !== undefined) data.date = new Date(req.body.date)
    if (req.body.location !== undefined) data.location = req.body.location.trim()
    if (req.body.isActive !== undefined) data.isActive = req.body.isActive
    
    // Handle file upload (priority over imageUrl in body)
    if (req.file) {
      // Delete old file if exists
      const oldEvent = await Event.findById(req.params.id)
      if (oldEvent && oldEvent.imageUrl && oldEvent.imageUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', oldEvent.imageUrl)
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath)
          } catch (unlinkError) {
            // Log but don't fail if file deletion fails
            logger.warn('Failed to delete old file:', unlinkError)
          }
        }
      }
      data.imageUrl = `/uploads/${req.file.filename}`
    } else if (req.body.imageUrl !== undefined) {
      data.imageUrl = req.body.imageUrl.trim()
    }
    
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

