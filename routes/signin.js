import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js';
import xss from 'xss';

const router = Router();

/**
 * GET /signin
 * Serves the sign-in page.
 */
router.get('/', (req, res) => {
    if (req.session && req.session.user) {
        // Redirect to the private page if already signed in
        return res.redirect('/dashboard');
    }
    // Serve the sign-in HTML page
    res.sendFile('static/signin.html', { root: '.' });
});

/**
 * POST /signin
 * Handles user sign-in by validating credentials and managing sessions.
 */
router.post('/', async (req, res) => {
    try {
        // Validate and sanitize email and password input
        const email = xss(helper.emailCheck(req.body.email));
        const password = xss(helper.passwordCheck(req.body.password));

        // Retrieve the user from the database
        const usersCollection = await users();
        const user = await usersCollection.findOne({ email: email.toLowerCase() });
        if (user && await bcrypt.compare(password, user.hashed_password)) {
            // Set session with user details
            req.session.user = { email: user.email, userId: user._id };
            return res.redirect('/dashboard');
        }
        else{
            throw 'Email or Password incorrect';
        }
        // Redirect to registration if login fails
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({error: error});
    }
});

export default router;
