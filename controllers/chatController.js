const db = require('../models/index');
const { Op } = require('sequelize');

// Define polling interval constant
const POLLING = 5; // in seconds

/**
 * Render the chatroom page
 */
exports.getChatroomPage = async (req, res) => {
  try {
    // Get messages with sender information
    const messages = await db.Message.findAll({
      include: [
        {
          model: db.User,
          as: 'sender',
          attributes: ['firstName', 'lastName']
        }
      ],
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

    // Clear session error after displaying it
    req.session.error = null;
  } catch (err) {
    req.session.error = err.message;
    res.status(500).redirect('/');
  }
};

/**
 * Get all messages
 */
exports.getAllMessages = async (req, res) => {
  try {
    // Get all messages with sender info
    const messages = await db.Message.findAll({
      include: [
        {
          model: db.User,
          as: 'sender',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        messages
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
/**
 * Get new messages (for polling)
 */
exports.getMessages = async (req, res) => {
  try {
    // Get last update timestamp from client
    const lastUpdate = req.query.lastUpdate || 0;

    // Get messages newer than last update
    const messages = await db.Message.findAll({
      where: {
        updatedAt: { [Op.gt]: new Date(parseInt(lastUpdate)) }
      },
      include: [
        {
          model: db.User,
          as: 'sender',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        messages,
        timestamp: Date.now()
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
/**
 * Post a new message
 */
exports.postMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const senderId = req.session.user.id;

    // Validate message content
    if (!content || content.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Message cannot be empty'
      });
    }
    // Create new message
    const message = await db.Message.create({
      content,
      senderId
    });

    // Get the created message with sender info
    const newMessage = await db.Message.findByPk(message.id, {
      include: [
        {
          model: db.User,
          as: 'sender',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: newMessage
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
/**
 * Update a message
 */
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.session.user.id;

    // Find the message
    const message = await db.Message.findByPk(messageId);
    // Check if message exists
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }
    // Check if user is the sender
    if (message.senderId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only edit your own messages'
      });
    }

    // Update message
    message.content = content;
    await message.save();

    // Get updated message with sender info (For commit)
    const updatedMessage = await db.Message.findByPk(messageId, {
      include: [
        {
          model: db.User,
          as: 'sender',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: updatedMessage
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * Delete a message
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.session.user.id;

    // Find the message
    const message = await db.Message.findByPk(messageId);

    // Check if message exists
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.senderId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own messages'
      });
    }

    // Delete message
    await message.destroy();

    res.status(200).json({
      status: 'success',
      data: {
        id: messageId
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * Search messages
 */
exports.searchMessages = async (req, res) => {
  try {
    const { term } = req.query;

    // Get messages matching search term
    const messages = await db.Message.findAll({
      where: {
        content: { [Op.like]: `%${term}%` }
      },
      include: [
        {
          model: db.User,
          as: 'sender',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        messages
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};