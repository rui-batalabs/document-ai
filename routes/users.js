import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../config/mongoCollections.js';
import { addUserToDB } from '../data/users.js';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile('static/homepage.html', { root: '.' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersCollection = await users();
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (user && await bcrypt.compare(password, user.hashed_password)) {
      req.session.user = { username: user.username, email: user.email, userId: user._id };
      res.redirect('/private');
    } else {
      res.redirect('/register');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Add user to the database
    const newUser = {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      hashed_password: hashedPassword,
      profile_picture: '',
      uploaded_docs: [],
      queries: [],
    };

    const result = await addUserToDB(newUser); // Add user to DB function
    if (result) {
      res.redirect('/');
    } else {
      res.status(400).json({ error: 'Unable to register user.' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

export default router;