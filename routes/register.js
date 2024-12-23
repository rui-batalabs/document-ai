import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js';
import xss from 'xss';

const router = Router();

/**
 * GET /register
 * Serves the registration page. Redirects logged-in users to /private.
 */
router.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/private');
    }
    res.sendFile('static/register.html', { root: '.' });
});

/**
 * POST /register
 * Handles user registration by validating inputs, checking for existing accounts,
 * and storing new user data in the database.
 */
router.post('/', async (req, res) => {
    try {
        if (req.session && req.session.user) {
            return res.redirect('/private');
        }

        // Validate and sanitize email, password, and confirmPassword inputs
        const email = xss(helper.emailCheck(req.body.email));
        const password = xss(helper.passwordCheck(req.body.password));
        const confirmPassword = xss(helper.passwordCheck(req.body.confirmPassword));

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match.');
        }

        const usersCollection = await users();
        const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({error:'Email already exists.'});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user object
        const newUser = {
            email: email.toLowerCase(),
            hashed_password: hashedPassword,
            uploaded_docs: [],
            queries: [],
        };

        console.log('New User:', newUser);

        // Insert the new user into the database
        const insertResult = await usersCollection.insertOne(newUser);

        if (insertResult.acknowledged) {
            return res.redirect('/signin');
        } else {
            return res.status(500).json({error:'Failed to register user.'});
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({error: error});
    }
});

export default router;
