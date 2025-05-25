const db = require('../models/index');
const Cookies = require('cookies');
const { Op } = require('sequelize');

/**
 * @desc Logs in the user if found in the database and password matches
 * @param {Object} req - Express request object containing body.login and body.password
 * @param {Object} res - Express response object
 * @returns {void} redirects to homepage on success, login page on failure
 */
exports.login = async (req, res) => {
  try {
    // @note Find user by login, selecting only login and password fields
    const user = await db.User.findOne({ where: { login: req.body.login }, attributes: ['login', 'password'] });

    // @error If user not found, throw error
    if (!user) throw new Error('No user found with the given username');

    // @error If password doesn't match, throw error
    if (req.body.password !== user.password) throw new Error('Incorrect password');

    // @success Set session flags for logged in user
    req.session.loggedIn = true;
    req.session.isLoggedOut = false;

    // @success Redirect to homepage
    res.status(200).redirect('/');
  } catch (e) {
    // @error Save error message in session and redirect to login page
    req.session.error = e.message;
    res.status(400).redirect('/login');
  }
};

/**
 * @desc Logs out the user by setting loggedIn to false and isLoggedOut to true
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} returns JSON status success
 */
exports.logout = (req, res) => {
  // @action Reset session login flags
  req.session.loggedIn = false;
  req.session.isLoggedOut = true;

  // @success Respond with JSON success status
  res.status(200).json({ status: 'success' });
};

/**
 * @desc Middleware protecting routes; allows only if user logged in
 * @param {Object} req - Express request object containing session info
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware callback
 * @returns {void} calls next middleware if authorized, otherwise sends 401 error JSON
 */
exports.protectedRoute = (req, res, next) => {
  // @check If user is logged in via session, proceed
  if (req.session.loggedIn) {
    return next();
  }

  // @error Unauthorized access response
  res.status(401).json({ status: 'error', error: 'this route is protected' });
};
