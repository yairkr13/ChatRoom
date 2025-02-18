//signUpPage.js
var express = require('express');
var router = express.Router();

/* GET home page.Chan */
router.get('/', function(req, res, next) {
    const signupData = req.cookies.signupData || {}; // אם אין קוקי, נגדיר אובייקט ריק

    res.render('signUpPage', {
        title: 'Sign Up Page',
        email: signupData.email || '',
        firstname: signupData.firstname || '',
        lastname: signupData.lastname || ''
    });
});

router.post('/', function(req, res, next) {
    const { firstname, lastname, email } = req.body;

    // שמירת הנתונים בקוקיז
    res.cookie('signupData', { firstname, lastname, email }, { maxAge: 600000, httpOnly: true });

    if (firstname.length >=3 && lastname.length >=3 ) {
        res.redirect('/setPasswordPage');
    } else {
        res.redirect('/signUpPage');
    }
});

module.exports = router;
// דף לבדיקת סיסמאות , ואם הן נכונות אז נרשום את המשתמש
//בניית ejs
