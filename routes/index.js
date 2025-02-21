'use strict';

let express = require('express');
let router = express.Router();
const indexController = require("../controllers/indexController");
const isUser = require('../middlewares/userAuthentication');

router.get('/', indexController.getLoginPage); // מציג את עמוד ה-Login כברירת מחדל
router.get('/success', indexController.getSuccessPage);
router.get('/register', indexController.getregisterPage);
router.get('/userPage', isUser, indexController.getUserPage);
router.get('/chat', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('chat', { user: req.session.user });
});


module.exports = router;
