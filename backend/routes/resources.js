const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const verifyLocation = require('../middleware/locationVerification');
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

// Validation middleware
const validateResource = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').isIn(['lecture-notes', 'research-papers', 'past-questions', 'journal-papers', 'conference-videos', 'other-resources'])
];

// Get all resources (with location verification)
router.get('/', verifyLocation, async (req, res) => {
  try {
    const { category, search, sort = 'newest' } = req.query;
    let query = {};

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Apply search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Apply sorting
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions.uploadDate = 1;
        break;
      case 'downloads':
        sortOptions.downloads = -1;
        break;
      case 'title':
        sortOptions.title = 1;
        break;
      default: // newest
        sortOptions.uploadDate = -1;
    }

    const resources = await Resource.find(query)
      .sort(sortOptions)
      .populate('uploadedBy', 'name');

    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single resource (with location verification)
router.get('/:id', verifyLocation, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload new resource (admin only)
router.post('/',
  verifyToken,
  verifyAdmin,
  upload.single('file'),
  validateResource,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const resource = new Resource({
        ...req.body,
        fileUrl: req.file.path,
        cloudinaryId: req.file.filename,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedBy: req.user._id
      });

      await resource.save();
      res.status(201).json(resource);
    } catch (error) {
      console.error('Upload resource error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update resource (admin only)
router.put('/:id',
  verifyToken,
  verifyAdmin,
  validateResource,
  async (req, res) => {
    try {
      const resource = await Resource.findById(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Update fields
      Object.assign(resource, req.body);
      await resource.save();

      res.json(resource);
    } catch (error) {
      console.error('Update resource error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete resource (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Delete file from Cloudinary
    await cloudinary.uploader.destroy(resource.cloudinaryId);

    // Delete resource from database
    await resource.deleteOne();

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download resource (with location verification)
router.get('/:id/download', verifyLocation, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Get signed URL from Cloudinary
    const signedUrl = cloudinary.url(resource.cloudinaryId, {
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // URL expires in 1 hour
      resource_type: resource.fileType.startsWith('video/') ? 'video' : 'raw'
    });

    // Increment download count after successful URL generation
    resource.downloads += 1;
    await resource.save();

    res.json({
      downloadUrl: signedUrl,
      fileName: resource.fileName,
      fileType: resource.fileType,
      fileSize: resource.fileSize,
      downloads: resource.downloads
    });
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 