const Position = require('../models/Position')
const User = require('../models/User')

exports.getPositions = async (req, res) => {
  try {
    const positions = await Position.find().sort({ name: 1 })
    res.status(200).json({ success: true, data: positions })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching positions' })
  }
}

exports.createPosition = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' })
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const existing = await Position.findOne({ name: name.trim() })
    if (existing) return res.status(409).json({ success: false, message: 'Position already exists' })
    const pos = await Position.create({ name: name.trim(), slug, description })
    res.status(201).json({ success: true, data: pos })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating position' })
  }
}

exports.updatePosition = async (req, res) => {
  try {
    const { name, description } = req.body
    const pos = await Position.findById(req.params.id)
    if (!pos) return res.status(404).json({ success: false, message: 'Position not found' })
    if (name) pos.name = name.trim()
    if (description !== undefined) pos.description = description
    pos.slug = pos.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await pos.save()
    res.status(200).json({ success: true, data: pos })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating position' })
  }
}

exports.deletePosition = async (req, res) => {
  try {
    const pos = await Position.findById(req.params.id)
    if (!pos) return res.status(404).json({ success: false, message: 'Position not found' })
    // Prevent deletion if any users are assigned this position
    const assigned = await User.findOne({ position: pos._id })
    if (assigned) {
      return res.status(409).json({ success: false, message: 'Cannot delete position: one or more users are assigned to it' })
    }
    await pos.remove()
    res.status(200).json({ success: true, message: 'Position deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting position' })
  }
}
