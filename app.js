//app.js
var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var flash = require('connect-flash');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

const homePageRouter = require('./routes/homePage');
const usersRouter = require('./routes/users');
const signupRouter = require('./routes/signUpPage');
const setPasswordRouter = require('./routes/setPasswordPage');
const profilePageRouter = require('./routes/profilePage');

var app = express();

// הגדרת middleware ל־session
app.use(session({
  secret: 'some-secret-key',  // סוד שמגן על המידע ב־session
  resave: false,
  saveUninitialized: true
}));

app.use(flash());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
//URL-->
app.use('/', homePageRouter);
app.use('/signUpPage', signupRouter);
app.use('/users', usersRouter);
app.use('/setPasswordPage', setPasswordRouter);
app.use('/profilePage', profilePageRouter);

// הגדרת נתיבים (routes)
app.get('/', (req, res) => {
  res.render('homePage', {
    title: 'Home',
    messages: req.flash() // שולחים את ההודעות לעמוד ה־EJS
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { status: err.status || 500, message: err.message || 'An unexpected error occurred.' });
});

module.exports = app;
