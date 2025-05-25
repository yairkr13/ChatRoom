const db = require('../models/index');
const { Op } = require('sequelize');

// Define polling interval constant
const POLLING = 5; // in seconds

/**
 * @desc Render the chatroom page with messages and user data
 */
exports.getChatroomPage = async (req, res) => {
  try {
    // Get messages with sender info, ordered newest first
    const messages = await db.Message.findAll({
      include: [{ model: db.User, as: 'sender', attributes: ['firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']]
    });

    res.render('chatroom', {
      title: 'Chatroom',
      page: 'chatroom',
      isAuth: req.session.loggedIn,
      user: req.session.user,
      messages,
      POLLING,
      error: req.session.error
    });

    // Clear session error after rendering
    req.session.error = null;
  } catch (err) {
    req.session.error = err.message;
    res.status(500).redirect('/');
  }
};

/**
 * @desc Get all messages API endpoint
 */
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await db.Message.findAll({
      include: [{ model: db.User, as: 'sender', attributes: ['firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ status: 'success', data: { messages } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * @desc Get new messages updated since lastUpdate (polling)
 */
exports.getMessages = async (req, res) => {
  try {
    const lastUpdate = req.query.lastUpdate || 0;

    const messages = await db.Message.findAll({
      where: { updatedAt: { [Op.gt]: new Date(parseInt(lastUpdate)) } },
      include: [{ model: db.User, as: 'sender', attributes: ['firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ status: 'success', data: { messages, timestamp: Date.now() } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * @desc Post a new message API endpoint
 */
exports.postMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const senderId = req.session.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'Message cannot be empty' });
    }

    const message = await db.Message.create({ content, senderId });

    const newMessage = await db.Message.findByPk(message.id, {
      include: [{ model: db.User, as: 'sender', attributes: ['firstName', 'lastName'] }]
    });

    res.status(201).json({ status: 'success', data: { message: newMessage } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * @desc Update a message by ID API endpoint
 */
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.session.user.id;

    const message = await db.Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ status: 'error', message: 'Message not found' });
    }
    if (message.senderId !== userId) {
      return res.status(403).json({ status: 'error', message: 'You can only edit your own messages' });
    }

    message.content = content;
    await message.save();

    const updatedMessage = await db.Message.findByPk(messageId, {
      include: [{ model: db.User, as: 'sender', attributes: ['firstName', 'lastName'] }]
    });

    res.status(200).json({ status: 'success', data: { message: updatedMessage } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * @desc Delete a message by ID API endpoint
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.session.user.id;

    const message = await db.Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ status: 'error', message: 'Message not found' });
    }
    if (message.senderId !== userId) {
      return res.status(403).json({ status: 'error', message: 'You can only delete your own messages' });
    }

    await message.destroy();

    res.status(200).json({ status: 'success', data: { id: messageId } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * @desc Search messages by content API endpoint
 */
exports.searchMessages = async (req, res) => {
  try {
    const { term } = req.query;

    const messages = await db.Message.findAll({
      where: { content: { [Op.like]: `%${term}%` } },
      include: [{ model: db.User, as: 'sender', attributes: ['firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ status: 'success', data: { messages } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
