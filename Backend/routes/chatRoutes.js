const express = require('express');
const router = express.Router();
const { handleChatMessage } = require('../controllers/chatController');

// You can add your authMiddleware here if you only want logged-in users to chat
// const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/chat
// @desc    Handles a simple chat message
// @access  Public
router.post('/', handleChatMessage);

// Example of a protected route:
// router.post('/', protect, handleChatMessage);

module.exports = router;