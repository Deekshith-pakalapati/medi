const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

router.post('/', requireAuth, chatController.chat);
router.get('/history', requireAuth, chatController.getChatHistory);
router.delete('/clear', requireAuth, chatController.clearChatHistory);

module.exports = router;
