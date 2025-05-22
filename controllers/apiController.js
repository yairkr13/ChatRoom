const db = require('../models/index');
const Cookies = require('cookies');
const { Op } = require('sequelize');

/**
 *
 * this func is logging it the user if he found in the db
 */
exports.login = async (req, res) => {
  try {
    const user = await db.User.findOne({ where: { login: req.body.login }, attributes: ['login', 'password'] });
    if (!user) throw new Error('No user found with the given username');
    if (req.body.password !== user.password) throw new Error('Incorrect password');

    req.session.loggedIn = true;
    req.session.isLoggedOut = false;
    res.status(200).redirect('/');
  } catch (e) {
    req.session.error = e.message;
    res.status(400).redirect('/login');
  }
};
/**
 *
 * this func is setting the logged in to false
 */
exports.logout = (req, res) => {
  req.session.loggedIn = false;
  req.session.isLoggedOut = true;
  res.status(200).json({ status: 'success' });
};

exports.protectedRoute = (req, res, next) => {
    if(req.session.loggedIn){
      return next()
    }
    res.status(401).json({ status: 'error', "error": "this route is protected" });
}