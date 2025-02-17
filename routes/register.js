var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'Register Page' });
});

router.post('/', function(req, res, next) {
    const {firstname} = req.body;
    //פה יהיה בדיקה מול המסד נתונים שהאימייל באמת פנוי.!!!!
    if (firstname === 'ron'){
        //נכניס קוקי עם הפרטים של המשתמש שתקף למשך הזמן שסולנ רשמה
        res.redirect('/register'); // לעמוד הסיסמאות
    }else{
        res.redirect('/'); // register
    }

    // res.render('register', { title: 'Register Page' });
});

module.exports = router;
// דף לבדיקת סיסמאות , ואם הן נכונות אז נרשום את המשתמש
//בניית ejs
