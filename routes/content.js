const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;
const Content = require('../models/Content');
const Purchase = require('../models/Purchase');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  }
});

// @route   POST /api/content/upload
// @desc    Upload new content
// @access  Private
router.post('/upload', auth, upload.single('file'), [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('price')
    .isFloat({ min: 0.01, max: 1000 })
    .withMessage('Price must be between $0.01 and $1000'),
  body('category')
    .isIn(['art', 'photography', 'music', 'videos', 'other'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, price, category, tags } = req.body;

    // Determine content type
    const isVideo = req.file.mimetype.startsWith('video/');
    const contentType = isVideo ? 'video' : 'image';

    // Upload to Cloudinary
    const uploadOptions = {
      resource_type: isVideo ? 'video' : 'image',
      folder: `surprise-me/${contentType}s`,
      public_id: `${req.user.userId}_${Date.now()}`,
    };

    if (isVideo) {
      uploadOptions.eager = [
        { width: 640, height: 480, crop: 'scale' }
      ];
    }

    const uploadResult = await cloudinary.uploader.upload_stream(
      uploadOptions,
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'File upload failed' });
        }

        try {
          // Create content record
          const content = new Content({
            creator: req.user.userId,
            title,
            description: description || '',
            type: contentType,
            fileUrl: result.secure_url,
            thumbnailUrl: result.thumbnail_url || result.secure_url,
            price: parseFloat(price),
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            fileSize: req.file.size,
            duration: result.duration || 0,
            dimensions: {
              width: result.width,
              height: result.height
            }
          });

          await content.save();

          res.status(201).json({
            message: 'Content uploaded successfully',
            content: {
              _id: content._id,
              title: content.title,
              description: content.description,
              type: content.type,
              thumbnailUrl: content.thumbnailUrl,
              price: content.price,
              category: content.category,
              tags: content.tags,
              createdAt: content.createdAt
            }
          });
        } catch (saveError) {
          console.error('Save content error:', saveError);
          res.status(500).json({ error: 'Failed to save content' });
        }
      }
    );

    uploadResult.end(req.file.buffer);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/content
// @desc    Get all content with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'popular':
        sortOption = { views: -1, purchases: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const content = await Content.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username profilePicture isVerified');

    const total = await Content.countDocuments(query);

    res.json({
      content,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: skip + content.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/content/:id
// @desc    Get specific content by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('creator', 'username profilePicture bio isVerified');

    if (!content || !content.isActive) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Increment views
    await content.incrementViews();

    res.json({ content });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/content/creator/:userId
// @desc    Get content by creator
// @access  Public
router.get('/creator/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const content = await Content.find({
      creator: req.params.userId,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username profilePicture isVerified');

    const total = await Content.countDocuments({
      creator: req.params.userId,
      isActive: true
    });

    res.json({
      content,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get creator content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/content/:id
// @desc    Update content
// @access  Private (creator only)
router.put('/:id', auth, [
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01, max: 1000 })
    .withMessage('Price must be between $0.01 and $1000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.creator.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this content' });
    }

    const { title, description, price, category, tags } = req.body;
    const updateFields = {};

    if (title) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (price) updateFields.price = parseFloat(price);
    if (category) updateFields.category = category;
    if (tags) updateFields.tags = tags.split(',').map(tag => tag.trim());

    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('creator', 'username profilePicture isVerified');

    res.json({
      message: 'Content updated successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private (creator only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.creator.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this content' });
    }

    // Soft delete by setting isActive to false
    content.isActive = false;
    await content.save();

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/content/trending
// @desc    Get trending content
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trending = await Content.getTrending(parseInt(limit));
    res.json({ content: trending });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 