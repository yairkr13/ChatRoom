// profilePage.js
var express = require('express');
var router = express.Router();

// הגדרת GET עבור /profilePage
router.get('/', function(req, res) {
    // שליפת נתוני המשתמש מקוקיז
    const userData = req.cookies.userData ? JSON.parse(req.cookies.userData) : null;

    if (userData) {
        // אם יש נתוני משתמש בקוקיז, הצג את עמוד ה־Profile עם השם
        res.render('profilePage', {
            title: 'Profile Page',
            message: `Welcome ${userData.firstname} ${userData.lastname} to your Profile Page!`
        });
    }

});

router.post('/', function(req, res) {
    console.log('Logging out...');
    //res.clearCookie('userData'); // מוחק את ה־cookie
    return res.redirect('/?message=Logged out successfully'); // שולח את המשתמש חזרה עם הודעה
});


module.exports = router;
