const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');
const db = require('./models/index');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session store setup with Sequelize
const sessionStore = new SequelizeStore({
  db: db.sequelize,
  expiration: 24 * 60 * 60 * 1000, // Session expiration (24 hours)
  checkExpirationInterval: 15 * 60 * 1000 // Cleanup expired sessions (15 minutes)
});

// Enable sessions
app.use(
    session({
      secret: 'chatroom_secret_key',
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
    })
);

// Set user authentication state for all requests
// Set user authentication state and handle flash messages
app.use((req, res, next) => {
  // Set default session values
  req.session.loggedIn = req.session.loggedIn || false;

  // Make session data available to views
  res.locals.isAuth = req.session.loggedIn;
  res.locals.user = req.session.user || null;

  // Move session messages into locals and clear from session
  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;
  delete req.session.error;
  delete req.session.success;

  next();
});

// Landing page route - redirects to login
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/chatroom');
  } else {
    res.redirect('/login');
  }
});

// Mount routes
app.use('/', authRoutes);
app.use('/', chatRoutes);

// 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Create session table
sessionStore.sync();

module.exports = app;
