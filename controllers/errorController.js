// controllers/errorController.js
module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong. Please try again later.';

    res.status(statusCode).render('error', {
        title: 'Error',
        msg: message
    });
};
