const User = require('../models/user');
const { generateOTP, sendOTP } = require('../utils/mailer');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        // Enforce Gmail-only on server side
        if (!/@gmail\.com$/i.test(email)) {
            req.flash('error', 'Only Gmail addresses (@gmail.com) are allowed to register.');
            return req.session.save(() => res.redirect('/register'));
        }

        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        // Generate OTP and send email
        const otp = generateOTP();
        registeredUser.otp = otp;
        registeredUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        await registeredUser.save();
        await sendOTP(email, otp);

        // Store email in session so verify page knows who to verify
        req.session.pendingEmail = email;
        req.flash('success', `A 6-digit OTP has been sent to ${email}. Please verify to continue.`);
        req.session.save(() => res.redirect('/verify-email'));

    } catch (e) {
        req.flash('error', e.message);
        req.session.save(() => res.redirect('/register'));
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = async (req, res, next) => {
    // req.user is set by passport at this point
    if (!req.user.isVerified) {
        // Send a fresh OTP for unverified users trying to log in
        try {
            const otp = generateOTP();
            req.user.otp = otp;
            req.user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await req.user.save();
            await sendOTP(req.user.email, otp);
        } catch (e) {
            console.error('Failed to send OTP:', e);
        }
        req.session.pendingEmail = req.user.email;
        // Log them back out — they haven't verified yet
        req.logout(function (err) { if (err) return next(err); });
        req.flash('error', 'Please verify your email first. A new OTP has been sent.');
        return req.session.save(() => res.redirect('/verify-email'));
    }

    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.session.save(() => {
        res.redirect(redirectUrl);
    });
}

module.exports.renderVerify = (req, res) => {
    const email = req.session.pendingEmail;
    if (!email) {
        req.flash('error', 'No pending verification. Please register or log in.');
        return res.redirect('/register');
    }
    res.render('users/verify', { email });
}

module.exports.verifyOTP = async (req, res, next) => {
    try {
        const { otp } = req.body;
        const email = req.session.pendingEmail;

        if (!email) {
            req.flash('error', 'Session expired. Please register again.');
            return req.session.save(() => res.redirect('/register'));
        }

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'User not found. Please register again.');
            return req.session.save(() => res.redirect('/register'));
        }

        if (!user.otp || !user.otpExpiry || new Date() > user.otpExpiry) {
            req.flash('error', 'OTP has expired. Please request a new one.');
            return req.session.save(() => res.redirect('/verify-email'));
        }

        if (user.otp !== otp.trim()) {
            req.flash('error', 'Incorrect OTP. Please try again.');
            return req.session.save(() => res.redirect('/verify-email'));
        }

        // Valid — mark user as verified
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        delete req.session.pendingEmail;

        // Log the user in
        req.login(user, err => {
            if (err) return next(err);
            req.flash('success', '✅ Email verified! Welcome to CampGlobe!');
            req.session.save(() => res.redirect('/campgrounds'));
        });
    } catch (e) {
        next(e);
    }
}

module.exports.resendOTP = async (req, res, next) => {
    try {
        const email = req.session.pendingEmail;
        if (!email) {
            req.flash('error', 'Session expired. Please register again.');
            return req.session.save(() => res.redirect('/register'));
        }

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'User not found. Please register again.');
            return req.session.save(() => res.redirect('/register'));
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await sendOTP(email, otp);

        req.flash('success', 'A fresh OTP has been sent to your email.');
        req.session.save(() => res.redirect('/verify-email'));
    } catch (e) {
        next(e);
    }
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        req.session.save(() => {
            res.redirect('/campgrounds');
        });
    });
}