import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {users} from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js';

const router = Router();

router.get('/', (req, res) => {
    // Check if session exists and user is logged in
    if (req.session && req.session.user) {
        return res.redirect('/private');
    }
    res.sendFile('static/register.html', {root: '.'});
});

router.post('/', async (req, res) => {
    // Check if session exists and user is logged in
    if (req.session && req.session.user) {
        return res.redirect('/private');
    }

    const email = helper.emailCheck(req.body.email);
    const password = helper.passwordCheck(req.body.password);
    const username = helper.usernameCheck(req.body.username);

    try {
        const usersCollection = await users();
        const existingUser = await usersCollection.findOne({email: email.toLowerCase()});

        if (existingUser) {
            console.log('Email already exists');
            res.status(400).send('Email already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        helper.hashedPasswordCheck(password, hashedPassword);

        const newUser = {
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            hashed_password: hashedPassword,
            profile_picture: '',
            uploaded_docs: [],
            queries: [],
        };

        console.log('New User:', newUser);

        const insertResult = await usersCollection.insertOne(newUser);
        if (insertResult.acknowledged) {
            res.redirect('/');
        } else {
            res.status(500).send('Failed to register user.');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
