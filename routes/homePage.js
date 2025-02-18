// homePage.js
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.clearCookie('signupData'); // מוחק את הקוקי 'signupData'

  // קריאת הודעה מסוג 'success' אם קיימת
  const message = req.query.message || '';  // אם יש הודעה בשורת ה-URL, נקרא אותה
  res.render('homePage', {
    title: 'Home Page',  // הגדרת title
    message: message  // אם יש הודעה, נשלח אותה אל ה-EJS
  });
});

// POST login request
router.post('/', function(req, res) {
  const { username, password } = req.body;

// קריאה מקוקי
  const userData = req.cookies.userData ? JSON.parse(req.cookies.userData) : null;

// בדיקת נתוני משתמש בעמוד הראשי
  if (!userData) {
    console.log('No user data found');
    // אם אין נתוני משתמש, הצג הודעה בעמוד הבית
    res.render('homePage', {
      title: 'Home Page',
      message: 'No user data found!'
    });
  }
  // else {
  //   console.log('User email: ', userData.email);
  //   // אם יש נתוני משתמש, הצג את העמוד המתאים (לדוגמה: profilePage)
  //   res.redirect('/profilePage');
  // }


  // אם המייל לא תואם
  if (username !== userData.email) {
    console.log('The username is: ',username);
    console.log('The email is: ',userData.email);
    console.log('Im here 2: ');
    return res.render('homePage', {
      title: 'Home Page',  // הוסף את ה-title כאן
      message: 'Email not found!'
    });
  }

  // אם הסיסמה לא נכונה
  if (password !== userData.password) {
    console.log('Im here 3: ');
    return res.render('homePage', {
      title: 'Home Page',  // הוסף את ה-title כאן
      message: 'Incorrect password!'
    });
  }
  console.log('Im here 4: ');

  // אם המייל והסיסמה תואמים, ננווט לעמוד אחר (נניח פרופיל)
  res.redirect('/profilePage');  // הפנייה לעמוד פרופיל (שיעודכן בהמשך)
});


module.exports = router;
