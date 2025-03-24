const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  emojis: {
    '👍': { type: Number, default: 0 },
    '❤️': { type: Number, default: 0 },
    '😊': { type: Number, default: 0 },
    '🎉': { type: Number, default: 0 },
    '👏': { type: Number, default: 0 }
  }
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  response: {
    type: String,
    trim: true
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  reactions: {
    type: reactionSchema,
    default: () => ({})
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responseDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search
questionSchema.index({
  question: 'text',
  response: 'text'
});

module.exports = mongoose.model('Question', questionSchema); 