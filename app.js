'use strict';

const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');  // הוספת מודול flash
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();

const sessionMiddleware = require('./middlewares/sessionMiddleware');
const REGISTER = 30 * 1000; // 30 seconds in milliseconds


let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

///////////////////////
const db = require('./models/index');

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false, // שינינו ל-false כדי למנוע session ריק
  cookie: { secure: false }
}));
app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to set session data
app.use(sessionMiddleware);

/* my routes */
app.use('/', indexRouter);
app.use('/users', usersRouter);



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
  res.render('error');
});

module.exports = app;
