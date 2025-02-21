'use strict';


/**
 * Middleware function to set session-related properties in the response locals.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const sessionMiddleware = (req, res, next) => {
    try {
        res.locals.loggedIn = req.session.loggedIn || false;
        res.locals.role = req.session.role || "user";
        res.locals.username = req.body.username || '';
        res.locals.password = req.body.password || '';
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        next(error)
    }


};

module.exports = sessionMiddleware;