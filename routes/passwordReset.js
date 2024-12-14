import { Router } from 'express';
import { passwordTokens, users } from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js';
import { userData, tokenData } from '../data/index.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import xss from 'xss';
import path from 'path'

const router = Router();

dotenv.config();

router.route('/')
    .get((req, res) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/');
        }
        res.sendFile(path.resolve('static/passwordReset.html'));
    })
    .post(async (req, res) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/');
        }

        try {
            const newPassword = xss(helper.passwordCheck(req.body.password));
            const confirmPassword = xss(helper.passwordCheck(req.body.confirmPassword));
            const email = xss(helper.emailCheck(req.session.user.email));

            if (newPassword !== confirmPassword) throw 'These passwords do not match';

            const updatedUser = await userData.changeUserPassword(email, newPassword, confirmPassword);
            console.log(updatedUser)
            res.redirect('/dashboard');
        } catch (e) {
            console.error('Error during password reset:', e);
            res.status(500).send('Internal Server Error');
        }
    });

router.route('/forgotPassword')
    .get((req, res) => {
        if (req.session?.user) {
            return res.redirect('/dashboard');
        }
        try {
            res.sendFile(path.resolve('static/forgotPassword.html'));
        } catch (e) {
            console.error('Error loading forgot password page:', e);
            res.status(500).send('Internal Server Error');
        }
    })
    .post(async (req, res) => {
        if (req.session?.user) {
            return res.redirect('/dashboard');
        }

        try {
            const email = xss(helper.emailCheck(req.body.email));
            const userCollection = await users();
            const user = await userCollection.findOne({ email });

            if (user) {
                const token = await tokenData.createToken(email);
                if (!token) throw 'Forgot password token creation failed';

                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD,
                    },
                });
                const info = await transporter.sendMail({
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Forgot Password',
                    html: `<p>Click <a href="http://localhost:3000/passwordreset/${token.token}">here</a> to reset your password</p>`,
                });

                if (!info) throw 'Message failed to send';
            }

            res.redirect('/');
        } catch (e) {
            console.error('Error sending forgot password email:', e);
            res.status(500).send('Internal Server Error');
        }
    });

router.route('/:token')
    .get(async (req, res) => {
        if (req.session?.user) {
            return res.redirect('/dashboard');
        }
        try {
            console.log(req.params.token);
            const token = xss(helper.tokenCheck(req.params.token));
            const updateToken = await tokenData.accessedToken(token);

            if (!updateToken) throw 'Error confirming token';

            res.sendFile(path.resolve('static/passwordReset.html'));
        } catch (e) {
            console.error('Error validating token:', e);
            res.status(500).send('Internal Server Error');
        }
    })
    .post(async (req, res) => {
        if (req.session?.user) {
            console.log("here1")
            return res.redirect('/dashboard');
        }

        try {
            console.log(req.body.test)
            console.log("here")
            const token = xss(helper.tokenCheck(req.params.token));
            const password = xss(helper.passwordCheck(req.body.password));
            const confirmPassword = xss(helper.passwordCheck(req.body.confirmPassword));
            console.log(token);
            if (password !== confirmPassword) throw 'These passwords do not match';

            const email = xss(helper.emailCheck((await passwordTokens().findOne({ token })).email));
            await userData.changeUserPassword(email, password, confirmPassword);

            res.redirect('/signin');
        } catch (e) {
            console.error('Error resetting password with token:', e);
            res.status(500).send('Internal Server Error');
        }
    });

export default router;
