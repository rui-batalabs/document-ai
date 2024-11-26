import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../config/mongoCollections.js';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile('static/registerpage.html', { root: '.' });
});

router.post('/', async (req, res) => {
  console.log(req.body)
  const { username, email, password } = req.body;

  try {
    const usersCollection = await users();
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log(400)
      res.status(400).send('Email already exists.');
      
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      hashed_password: hashedPassword,
      profile_picture: '',
      uploaded_docs: [],
      queries: [],
    };
    console.log(newUser)

    const insertResult = await usersCollection.insertOne(newUser);
    if (insertResult.acknowledged) {
      res.redirect('/');
    } else {
      res.status(500).send('Failed to register user.');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

export default router;
