import { Router } from 'express';
import { passwordTokens, users } from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js';
import { userData, tokenData } from '../data/index.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import xss from 'xss';

const router = Router();

router.route('/')
    .get((req, res) => {
        // Password change while being signed in
        if (!req.session || !req.session.user) {
            return res.redirect('/home');
        }
        res.render('passwordReset', { title: 'Password Reset' });
    })
    .post(async (req, res) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/home');
        }
        try {
            const newPassword = xss(helper.passwordCheck(req.body.password));
            const confirmPassword = xss(helper.passwordCheck(req.body.confirmPassword));
            const email = xss(helper.emailCheck(req.session.user.email));

            if (newPassword !== confirmPassword) throw 'These passwords do not match';

            const updatedUser = await userData.changeUserPassword(email, newPassword, confirmPassword);
            res.redirect('/dashboard');
        } catch (e) {
            console.error('Error during password reset:', e);
            res.status(500).send('Internal Server Error');
        }
    });

router.route('/forgotPassword')
    .get((req, res) => {
        // Page for submitting email for password reset
        if (req.session || req.session.user) {
            return res.redirect('/dashboard');
        }
        try {
            res.render('forgotPassword', { title: 'Forgot Password' });
        } catch (e) {
            console.error('Error loading forgot password page:', e);
            res.status(500).send('Internal Server Error');
        }
    })
    .post(async (req, res) => {
        if (req.session || req.session.user) {
            return res.redirect('/dashboard');
        }
        try {
            dotenv.config();
            const email = xss(helper.emailCheck(req.body.email));
            const userCollection = await users();
            const user = await userCollection.findOne({ email });

            if (user) {
                const token = await tokenData.createToken(email);
                if (!token) throw 'Forgot password token creation failed';

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD,
                    },
                });

                const info = await transporter.sendMail({
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Forgot Password',
                    html: `<p>Click <a href="http://localhost:3000/resetpassword/${token}">here</a> to reset your password</p>`,
                });

                if (!info) throw 'Message failed to send';
            }

            res.redirect('/home');
        } catch (e) {
            console.error('Error sending forgot password email:', e);
            res.status(500).send('Internal Server Error');
        }
    });

router.route('/:token')
    .get(async (req, res) => {
        // Token validation and reset page rendering
        if (req.session || req.session.user) {
            return res.redirect('/dashboard');
        }
        try {
            const token = xss(helper.tokenCheck(req.params.token));
            const updateToken = await tokenData.accessedToken(token);

            if (!updateToken) throw 'Error confirming token';

            res.render('passwordReset', { title: 'Password Reset' });
        } catch (e) {
            console.error('Error validating token:', e);
            res.status(500).send('Internal Server Error');
        }
    })
    .post(async (req, res) => {
        if (req.session || req.session.user) {
            return res.redirect('/dashboard');
        }
        try {
            const password = xss(helper.passwordCheck(req.body.password));
            const confirmPassword = xss(helper.passwordCheck(req.body.confirmPassword));

            if (password !== confirmPassword) throw 'These passwords do not match';

            const token = xss(helper.tokenCheck(req.params.token));
            const email = xss(helper.emailCheck((await passwordTokens().findOne({ token })).email));
            
            const updatedUser = await userData.changeUserPassword(email, password, confirmPassword);
            res.redirect('/signin');
        } catch (e) {
            console.error('Error resetting password with token:', e);
            res.status(500).send('Internal Server Error');
        }
    });

export default router;
