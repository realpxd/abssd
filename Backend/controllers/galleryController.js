const Gallery = require('../models/Gallery')
const path = require('path')
const fs = require('fs')
// Pagination removed for gallery: return full list
const logger = require('../utils/logger')

// Get all gallery items (public - only active)
// Get all gallery items (admin - all items)
exports.getGallery = async (req, res) => {
  try {
    // Check if user is admin (optional - req.user might not exist for public access)
    const isAdmin = req.user && req.user.role === 'admin'
    const query = isAdmin ? {} : { isActive: true }
    
    // Return full gallery list (no pagination)
    const gallery = await Gallery.find(query).sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: gallery.length, data: gallery })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching gallery',
    })
  }
}

// Create gallery item (admin)
exports.createGalleryItem = async (req, res) => {
  try {
    const data = {
      title: req.body.title?.trim(),
      titleEn: req.body.titleEn?.trim(),
      description: req.body.description?.trim(),
      category: req.body.category,
    }
    
    // Handle file upload (priority over imageUrl in body)
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`
    } else if (req.body.imageUrl) {
      data.imageUrl = req.body.imageUrl.trim()
    } else {
      return res.status(400).json({
        success: false,
        message: 'Image URL or image file is required',
      })
    }
    
    const galleryItem = await Gallery.create(data)
    res.status(201).json({
      success: true,
      data: galleryItem,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating gallery item',
    })
  }
}

// Update gallery item (admin)
exports.updateGalleryItem = async (req, res) => {
  try {
    const data = {}
    
    // Only update provided fields
    if (req.body.title !== undefined) data.title = req.body.title.trim()
    if (req.body.titleEn !== undefined) data.titleEn = req.body.titleEn.trim()
    if (req.body.description !== undefined) data.description = req.body.description.trim()
    if (req.body.category !== undefined) data.category = req.body.category
    if (req.body.isActive !== undefined) data.isActive = req.body.isActive
    
    // Handle file upload (priority over imageUrl in body)
    if (req.file) {
      // Delete old file if exists
      const oldItem = await Gallery.findById(req.params.id)
      if (oldItem && oldItem.imageUrl && oldItem.imageUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', oldItem.imageUrl)
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
    
    const galleryItem = await Gallery.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    })
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      })
    }
    res.status(200).json({
      success: true,
      data: galleryItem,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating gallery item',
    })
  }
}

// Delete gallery item (admin)
exports.deleteGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id)
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      })
    }
    
    // Delete associated file
    if (galleryItem.imageUrl && galleryItem.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', galleryItem.imageUrl)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (unlinkError) {
          // Log but don't fail if file deletion fails
          logger.warn('Failed to delete file:', unlinkError)
        }
      }
    }
    
    await Gallery.findByIdAndDelete(req.params.id)
    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting gallery item',
    })
  }
}

