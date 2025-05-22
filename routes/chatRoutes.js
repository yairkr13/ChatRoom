const express = require('express');
const authController = require('../controllers/authController');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Protect all chat routes - require login
router.use(authController.protectRoute);

// Chatroom page route
router.get('/chatroom', chatController.getChatroomPage);

// API routes (For commit)
router.get('/api/messages/all', chatController.getAllMessages);
router.get('/api/messages', chatController.getMessages);
router.post('/api/messages', chatController.postMessage);
router.put('/api/messages/:messageId', chatController.updateMessage);
router.delete('/api/messages/:messageId', chatController.deleteMessage);
router.get('/api/messages/search', chatController.searchMessages);

module.exports = router;