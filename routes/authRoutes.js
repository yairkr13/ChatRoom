const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Login routes
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Registration routes
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.registerFirstStep);
router.get('/register/password', authController.getPasswordPage);
router.post('/register/back', authController.handleBackToRegister);
router.post('/register/password', authController.registerComplete);

module.exports = router;
