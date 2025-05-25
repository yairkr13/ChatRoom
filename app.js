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
    checkExpirationInterval: 15 * 60 * 1000 // Cleanup expired sessions every 15 minutes
});

// Enable sessions
app.use(
    session({
        secret: 'chatroom_secret_key',   // Secret key for signing session ID cookie
        resave: false,                   // Don't save session if unmodified
        saveUninitialized: false,        // Don't create session until something stored
        store: sessionStore,             // Use Sequelize-backed session store
        cookie: { maxAge: 24 * 60 * 60 * 1000 } // Cookie expiration 24 hours
    })
);

// Middleware to set user authentication status and flash messages for all views
app.use((req, res, next) => {
    // Ensure loggedIn session flag is defined
    req.session.loggedIn = req.session.loggedIn || false;

    // Make auth and user info available in all rendered views
    res.locals.isAuth = req.session.loggedIn;
    res.locals.user = req.session.user || null;

    // Transfer flash messages from session to response locals and clear them
    res.locals.error = req.session.error || null;
    res.locals.success = req.session.success || null;
    delete req.session.error;
    delete req.session.success;

    next();
});

// Root route redirects to chatroom if logged in, otherwise to login page
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/chatroom');
    } else {
        res.redirect('/login');
    }
});

// Mount authentication and chat related routes
app.use('/', authRoutes);
app.use('/', chatRoutes);

// Handle 404 - all unmatched routes
app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

// Sync session store to create session table if it doesn't exist
sessionStore.sync();

module.exports = app;
