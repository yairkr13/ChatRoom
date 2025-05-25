const db = require('../models/index');
const { Op } = require('sequelize');

const REGISTER = 30;

/**
 * @desc Middleware to set loggedIn flag in session if not set
 */
exports.isLoggedIn = (req, res, next) => {
  req.session.loggedIn = req.session.loggedIn || false;
  next();
};

/**
 * @desc Middleware to protect routes - only allow if logged in
 */
exports.protectRoute = (req, res, next) => {
  if (!req.session.loggedIn) {
    return res.status(401).redirect('/');
  }
  next();
};

/**
 * @desc Render login page or redirect if already logged in
 */
exports.getLoginPage = (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect('/chatroom');
  }

  // Clear registration cookies on login page load
  res.clearCookie('firstName');
  res.clearCookie('lastName');
  res.clearCookie('email');

  res.render('login', {
    title: 'Login',
    page: 'login',
    isAuth: req.session.loggedIn
  });
};

/**
 * @desc Handle login submission: verify email & password, set session
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email case-insensitively
    const user = await db.User.findOne({
      where: {
        email: { [Op.like]: email.toLowerCase() }
      }
    });

    // Validate user existence and password match
    if (!user || user.password !== password) {
      req.session.error = 'Invalid email or password';
      return res.status(400).redirect('/login');
    }

    // Set session user info and loggedIn flag
    req.session.loggedIn = true;
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    res.redirect('/chatroom');
  } catch (err) {
    req.session.error = err.message;
    res.status(400).redirect('/login');
  }
};

/**
 * @desc Handle user logout by destroying session and redirecting
 */
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

/**
 * @desc Render the first step registration page with any saved cookies
 */
exports.getRegisterPage = (req, res) => {
  const firstName = req.cookies.firstName || '';
  const lastName = req.cookies.lastName || '';
  const email = req.cookies.email || '';

  res.render('register', {
    title: 'Register',
    page: 'register',
    isAuth: req.session.loggedIn,
    firstName,
    lastName,
    email
  });
};

/**
 * @desc Handle first step registration - validate inputs, check email uniqueness,
 *       save data in cookies and redirect to password step
 */
exports.registerFirstStep = async (req, res) => {
  try {
    let { firstName, lastName, email } = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();
    email = email.trim().toLowerCase();

    // Validate names and email format
    if (!/^[a-zA-Z]{3,32}$/.test(firstName)) {
      req.session.error = 'First name should be 3-32 letters only';
      return res.status(400).redirect('/register');
    }
    if (!/^[a-zA-Z]{3,32}$/.test(lastName)) {
      req.session.error = 'Last name should be 3-32 letters only';
      return res.status(400).redirect('/register');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      req.session.error = 'Please provide a valid email address';
      return res.status(400).redirect('/register');
    }

    // Check email uniqueness
    const existingUser = await db.User.findOne({
      where: { email: { [Op.like]: email } }
    });
    if (existingUser) {
      req.session.error = 'This email is already in use, please choose another one';
      return res.status(400).redirect('/register');
    }

    // Save data in cookies with 30 second expiration on /register path
    res.cookie('firstName', firstName, { maxAge: REGISTER * 1000, path: '/register' });
    res.cookie('lastName', lastName, { maxAge: REGISTER * 1000, path: '/register' });
    res.cookie('email', email, { maxAge: REGISTER * 1000, path: '/register' });

    res.redirect('/register/password');
  } catch (err) {
    req.session.error = err.message;
    res.status(400).redirect('/register');
  }
};

/**
 * @desc Handle "Back" button from password step, redirects back to first step
 */
exports.handleBackToRegister = (req, res) => {
  res.redirect('/register');
};

/**
 * @desc Render password setup page; redirect to register if cookies missing
 */
exports.getPasswordPage = (req, res) => {
  const firstName = req.cookies.firstName;
  const lastName = req.cookies.lastName;
  const email = req.cookies.email;

  if (!firstName || !lastName || !email) {
    return res.redirect('/register');
  }

  res.render('register-password', {
    title: 'Set Password',
    page: 'register',
    isAuth: req.session.loggedIn,
    firstName,
    lastName,
    email
  });
};

/**
 * @desc Handle password submission, validate and complete registration
 */
exports.registerComplete = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    const firstName = req.cookies.firstName;
    const lastName = req.cookies.lastName;
    const email = req.cookies.email;

    if (!firstName || !lastName || !email) {
      req.session.error = 'Session expired. Please start the registration again.';
      return res.redirect('/register');
    }

    if (password !== confirmPassword) {
      req.session.error = 'Passwords do not match';
      return res.status(400).redirect('/register/password');
    }

    if (password.length < 3 || password.length > 32) {
      req.session.error = 'Password must be between 3 and 32 characters';
      return res.status(400).redirect('/register/password');
    }

    const existingUser = await db.User.findOne({
      where: { email: { [Op.like]: email } }
    });
    if (existingUser) {
      req.session.error = 'This email is already in use, please choose another one';
      return res.status(400).redirect('/register');
    }

    await db.User.create({
      firstName,
      lastName,
      email,
      password
    });

    res.clearCookie('firstName', { path: '/register' });
    res.clearCookie('lastName', { path: '/register' });
    res.clearCookie('email', { path: '/register' });

    req.session.success = 'You are now registered';
    res.redirect('/login');
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => e.message);
      req.session.error = errors.join(', ');
    } else {
      req.session.error = err.message;
    }
    res.status(400).redirect('/register/password');
  }
};
