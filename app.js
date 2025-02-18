//app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

const homePageRouter = require('./routes/homePage');
const usersRouter = require('./routes/users');
const signupRouter = require('./routes/signUpPage');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homePageRouter);
app.use('/signUpPage', signupRouter);
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
  res.render('error', { status: err.status || 500, message: err.message || 'An unexpected error occurred.' });
});

module.exports = app;
