const SocialCard = require('../models/SocialCard');
const {
  getPaginationParams,
  getPaginationResponse,
} = require('../utils/pagination');
const { sanitizeString } = require('../utils/validators');

// Create or update social card
exports.createSocialCard = async (req, res) => {
  try {
    const { name, address, generated } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name and address are required',
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedAddress = sanitizeString(address);

    const socialCard = await SocialCard.create({
      name: sanitizedName,
      address: sanitizedAddress,
      generated: generated || false,
    });

    res.status(201).json({
      success: true,
      message: 'Social card data saved successfully',
      data: {
        id: socialCard._id,
        name: socialCard.name,
        address: socialCard.address,
        generated: socialCard.generated,
      },
    });
  } catch (error) {
    console.error('Error creating social card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save social card data',
      error: error.message,
    });
  }
};

// Get all social cards (Admin only)
exports.getAllSocialCards = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { search } = req.query;

    let query = {};

    // Search by name or address
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const socialCards = await SocialCard.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SocialCard.countDocuments(query);
    const generatedCount = await SocialCard.countDocuments({ generated: true });

    res.json({
      success: true,
      data: socialCards,
      pagination: getPaginationResponse(total, page, limit),
      stats: {
        total,
        generated: generatedCount,
        notGenerated: total - generatedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching social cards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social cards',
      error: error.message,
    });
  }
};

// Get single social card by ID (Admin only)
exports.getSocialCardById = async (req, res) => {
  try {
    const socialCard = await SocialCard.findById(req.params.id);

    if (!socialCard) {
      return res.status(404).json({
        success: false,
        message: 'Social card not found',
      });
    }

    res.json({
      success: true,
      data: socialCard,
    });
  } catch (error) {
    console.error('Error fetching social card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social card',
      error: error.message,
    });
  }
};

// Delete social card (Admin only)
exports.deleteSocialCard = async (req, res) => {
  try {
    const socialCard = await SocialCard.findByIdAndDelete(req.params.id);

    if (!socialCard) {
      return res.status(404).json({
        success: false,
        message: 'Social card not found',
      });
    }

    res.json({
      success: true,
      message: 'Social card deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting social card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete social card',
      error: error.message,
    });
  }
};

// Get stats (Admin only)
exports.getSocialCardStats = async (req, res) => {
  try {
    const total = await SocialCard.countDocuments();
    const generated = await SocialCard.countDocuments({ generated: true });

    // Get recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = await SocialCard.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      success: true,
      stats: {
        total,
        generated,
        notGenerated: total - generated,
        recent: recentCount,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message,
    });
  }
};
