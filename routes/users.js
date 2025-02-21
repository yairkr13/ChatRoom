'use strict';

let express = require('express');
let router = express.Router();
const userController = require("../controllers/userController");
const isUser = require('../middlewares/userAuthentication');

// Route for handling user login POST request
router.post('/login', userController.login);

// Route for handling user logout POST request
router.post('/logout', userController.logOut);

// Route for handling user registration
router.post('/register', userController.register);

// Route for handling user registration GET request (shows the register page)
router.get('/register', userController.renderRegisterPage);

// Route for handling user registration POST request (processes the registration form)
router.post('/register', userController.register);

// Route for rendering the set-password page
router.get('/set-password', userController.renderSetPasswordPage);

// Route for handling password submission
router.post('/set-password', userController.setPassword);

// Route for rendering the chat page (after login)
router.get('/chat', isUser, (req, res) => {
    res.render('chat', { user: req.session.user }); // ודא שהמשתמש מחובר
});

module.exports = router;
