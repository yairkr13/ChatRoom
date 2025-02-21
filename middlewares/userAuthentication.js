'use strict';

/**
 * Middleware function to check if the user is authenticated as an user.
 * If the user is not logged in, redirects to the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const isUser = async (req, res, next) => {
    try {
        if (!req.session.loggedIn) {
            return res.status(401).render('login');
        }
        next(); // If logged in, proceed to the next middleware or route handler

    } catch (error) {
        next(error)
    }
};

module.exports = isUser;
