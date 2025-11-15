const Gallery = require('../models/Gallery')
const path = require('path')
const fs = require('fs')

// Get all gallery items (public - only active)
// Get all gallery items (admin - all items)
exports.getGallery = async (req, res) => {
  try {
    // Check if user is admin (optional - req.user might not exist for public access)
    const isAdmin = req.user && req.user.role === 'admin'
    const query = isAdmin ? {} : { isActive: true }
    const gallery = await Gallery.find(query).sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      count: gallery.length,
      data: gallery,
    })
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
    const data = { ...req.body }
    
    // Handle file upload (priority over imageUrl in body)
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`
    } else if (!data.imageUrl) {
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
    const data = { ...req.body }
    
    // Handle file upload (priority over imageUrl in body)
    if (req.file) {
      // Delete old file if exists
      const oldItem = await Gallery.findById(req.params.id)
      if (oldItem && oldItem.imageUrl && oldItem.imageUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', oldItem.imageUrl)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }
      data.imageUrl = `/uploads/${req.file.filename}`
    }
    // If no file uploaded, use imageUrl from body (if provided)
    
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
        fs.unlinkSync(filePath)
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

