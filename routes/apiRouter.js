const express = require('express');

const apiController = require('../controllers/apiController');
const router = express.Router();

router.route('/login').post(apiController.login);

router.route('/logout').get(apiController.logout);

router.use(apiController.protectedRoute);

module.exports = router;
