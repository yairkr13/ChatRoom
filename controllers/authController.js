const db = require('../models/index');
const { Op } = require('sequelize');

const REGISTER = 30;

/**
 * Check if user is logged in
 */
exports.isLoggedIn = (req, res, next) => {
  req.session.loggedIn = req.session.loggedIn || false;
  next();
};

/**
 * Protect routes - only accessible if logged in
 */
exports.protectRoute = (req, res, next) => {
  if (!req.session.loggedIn) {
    return res.status(401).redirect('/');
  }
  next();
};

/**
 * Render the login page
 */
exports.getLoginPage = (req, res) => {
  // Redirect to chatroom if already logged in
  if (req.session.loggedIn) {
    return res.redirect('/chatroom');
  }

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
 * Handle login submission
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (case insensitive)
    const user = await db.User.findOne({
      where: {
        email: { [Op.like]: email.toLowerCase() }
      }
    });

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      req.session.error = 'Invalid email or password';
      return res.status(400).redirect('/login');
    }

    // Set user session data
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
 * Handle logout
 */
exports.logout = (req, res) => {
  // Clear session
  req.session.destroy();

  // Redirect to login page
  res.redirect('/');
};

/**
 * Render the registration page (first step)
 */
exports.getRegisterPage = (req, res) => {
  let firstName = req.cookies.firstName || '';
  let lastName = req.cookies.lastName || '';
  let email = req.cookies.email || '';

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
 * Handle first step of registration
 */
exports.registerFirstStep = async (req, res) => {
  try {
    let { firstName, lastName, email } = req.body;

    // Sanitize input
    firstName = firstName.trim();
    lastName = lastName.trim();
    email = email.trim().toLowerCase();

    // Validate format
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

    // Check if email already exists
    const existingUser = await db.User.findOne({
      where: {
        email: { [Op.like]: email }
      }
    });

    if (existingUser) {
      req.session.error = 'This email is already in use, please choose another one';
      return res.status(400).redirect('/register');
    }

    // Store user data in cookies with expiration (30 seconds)
    res.cookie('firstName', firstName, { maxAge: REGISTER * 1000, path: '/register' });
    res.cookie('lastName', lastName, { maxAge: REGISTER * 1000, path: '/register' });
    res.cookie('email', email, { maxAge: REGISTER * 1000, path: '/register' });


    // Redirect to password form
    res.redirect('/register/password');
  } catch (err) {
    req.session.error = err.message;
    res.status(400).redirect('/register');
  }
};

/**
 * Handle "Back" action and save data back to cookies
 */
exports.handleBackToRegister = (req, res) => {
  res.redirect('/register');
}

/**
 * Render the password page (second step of registration)
 */
exports.getPasswordPage = (req, res) => {
  const firstName = req.cookies.firstName;
  const lastName = req.cookies.lastName;
  const email = req.cookies.email;

  // אם הקוקיז לא קיימים, החזר לעמוד הרישום
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
 * Handle password submission and complete registration
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