const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['lecture-notes', 'research-papers', 'past-questions', 'journal-papers', 'conference-videos', 'other-resources']
  },
  courseCode: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  department: String,
  level: {
    type: String,
    enum: ['100', '200', '300', '400', '500', 'postgraduate', '']
  },
  semester: {
    type: String,
    enum: ['first', 'second', '']
  },
  academicYear: String,
  tags: [String],
  fileUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Update lastModified on save
resourceSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Create text index for search
resourceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  courseCode: 'text',
  author: 'text'
});

module.exports = mongoose.model('Resource', resourceSchema); 