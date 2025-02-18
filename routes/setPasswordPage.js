var express = require('express');
var router = express.Router();

// GET password page
router.get('/', function(req, res, next) {
    console.log("IM HERE");
    // שליחה של הודעות פלאש (אם יש)
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('setPasswordPage', {
        title: 'Set Password',
        successMessage: successMessage,
        errorMessage: errorMessage
    });
});

// POST password page
// setPasswordPage.js
router.post('/', function(req, res, next) {
    const { password, confirmPassword } = req.body;

    // בדיקה אם שתי הסיסמאות תואמות
    if (password === confirmPassword && password.length >= 6) {
        // שמירת הנתונים בקוקי (כולל הסיסמה)
        const signupData = req.cookies.signupData || {};
        res.cookie('userData', JSON.stringify({
            email: signupData.email,
            firstname: signupData.firstname,
            lastname: signupData.lastname,
            password: password  // שמירה של הסיסמה בצורה לא מאובטחת - יש לקחת בחשבון לא לשמור סיסמה ככה
        }), { maxAge: 600000, httpOnly: true });
;

        // שליחת הודעה מסוג success
        req.flash('success', 'User Created Successfully');

        // הפניה לעמוד הבית
        res.redirect('/');
    } else {
        res.render('setPasswordPage', {
            title: 'Set Password',
            error: 'Passwords do not match or are too short!'
        });
    }
});
;

module.exports = router;
