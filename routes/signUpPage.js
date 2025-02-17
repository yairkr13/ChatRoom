//signUpPage.js
var express = require('express');
var router = express.Router();

/* GET home page.Chan */
router.get('/', function(req, res, next) {
    res.render('signUpPage', { title: 'Sign Up Page' });
});

router.post('/', function(req, res, next) {
    const {firstname} = req.body;
    //פה יהיה בדיקה מול המסד נתונים שהאימייל באמת פנוי.!!!!
    if (firstname === 'ron'){
        //נכניס קוקי עם הפרטים של המשתמש שתקף למשך הזמן שסולנ רשמה
        res.redirect('/signUpPage'); // לעמוד הסיסמאות
    }else{
        res.redirect('/'); // signUpPage
    }

    // res.render('register', { title: 'Register Page' });
});

module.exports = router;
// דף לבדיקת סיסמאות , ואם הן נכונות אז נרשום את המשתמש
//בניית ejs
