const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const verifyLocation = require('../middleware/locationVerification');

// Validation middleware
const validateQuestion = [
  body('question').trim().notEmpty(),
  body('email').isEmail().normalizeEmail()
];

const validateResponse = [
  body('response').trim().notEmpty()
];

// Get all questions (with location verification)
router.get('/', verifyLocation, async (req, res) => {
  try {
    const { search, answered } = req.query;
    let query = {};

    // Apply search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Apply answered filter
    if (answered !== undefined) {
      query.isAnswered = answered === 'true';
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .populate('respondedBy', 'name');

    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single question (with location verification)
router.get('/:id', verifyLocation, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('respondedBy', 'name');
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post new question (with location verification)
router.post('/', verifyLocation, validateQuestion, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = new Question({
      question: req.body.question,
      email: req.body.email
    });

    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.error('Post question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add response to question (admin only)
router.post('/:id/respond',
  verifyToken,
  verifyAdmin,
  validateResponse,
  async (req, res) => {
    try {
      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      question.response = req.body.response;
      question.isAnswered = true;
      question.respondedBy = req.user._id;
      question.responseDate = new Date();

      await question.save();
      res.json(question);
    } catch (error) {
      console.error('Add response error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update reaction
router.post('/:id/react', verifyLocation, async (req, res) => {
  try {
    const { type, action } = req.body;
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Handle different reaction types
    if (type === 'like' || type === 'dislike') {
      question.reactions[type + 's'] += action === 'add' ? 1 : -1;
    } else if (type in question.reactions.emojis) {
      question.reactions.emojis[type] += action === 'add' ? 1 : -1;
    } else {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    await question.save();
    res.json(question.reactions);
  } catch (error) {
    console.error('Update reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.deleteOne();
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 