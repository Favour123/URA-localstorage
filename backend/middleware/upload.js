const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ura-resources',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'webm', 'zip'],
    resource_type: 'auto'
  }
});

// File size limits (in bytes)
const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB
};

// File filter function
const fileFilter = (req, file, cb) => {
  // Get category from request body or params
  const category = req.body.category || req.params.category;
  
  // Define allowed types per category
  const allowedTypes = {
    'lecture-notes': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    'research-papers': ['application/pdf'],
    'past-questions': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'journal-papers': ['application/pdf'],
    'conference-videos': ['video/mp4', 'video/webm'],
    'other-resources': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/mp4', 'application/zip']
  };

  if (!category || !allowedTypes[category]) {
    cb(new Error('Invalid category'), false);
    return;
  }

  if (allowedTypes[category].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types for ${category}: ${allowedTypes[category].join(', ')}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: limits,
  fileFilter: fileFilter
});

module.exports = upload; 