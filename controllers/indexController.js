'use strict';

module.exports = {

    /**
     * Renders the home page view.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    getHomePage(req, res) {
        res.render('homePage');
    },

    /**
     * Renders the success page view.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    getSuccessPage(req, res) {
        res.render('success');
    },

    /**
     * Renders the new ad page view, optionally populating form fields with last ad data.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async getNewAdPage(req, res) {
        res.render('newAd', {errors: {}, formData: {}});  // Render the new ad page with empty form data and errors object
    },

    /**
     * Renders the login page view.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    getLoginPage(req, res) {
        console.log("Query Params:", req.query); // בדיקה אם הנתונים מגיעים
        res.render('login', { errors: {}, formData: {}, success: req.query.success });
    },

    /**
     * Renders the register page view.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    getregisterPage(req, res) {
        let formData = {};

        // אם יש קוקי עם נתוני הרשמה, נטען אותם
        if (req.cookies.registerData) {
            try {
                formData = JSON.parse(req.cookies.registerData);
            } catch (e) {
                console.error("Error parsing registerData cookie:", e);
            }
        }
        res.render('register', { errors: {}, formData });
    },

    /**
     * Renders the user page view.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    getUserPage(req, res) {
        res.render('userPage');
    },

};
