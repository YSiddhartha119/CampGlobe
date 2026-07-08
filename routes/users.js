const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const { storeReturnTo } = require('../middleware');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(users.login))

router.route('/verify-email')
    .get(users.renderVerify)
    .post(catchAsync(users.verifyOTP));

router.post('/resend-otp', catchAsync(users.resendOTP));

router.get('/logout', users.logout)

module.exports = router;