import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {users} from '../config/mongoCollections.js';
import {userData} from '../data/index.js';
import helper from '../serverSideHelpers.js'

const router = Router();

router.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/private');
    }
    res.sendFile('static/homepage.html', {root: '.'});
});


router.post('/login', async (req, res) => {

    helper.emailCheck(req.body.email);
    helper.passwordCheck(req.body.password);

    const {email, password} = req.body;


    try {
        const usersCollection = await users();
        const user = await usersCollection.findOne({email: email.toLowerCase()});

        if (user && await bcrypt.compare(password, user.hashed_password)) {
            req.session.user = {username: user.username, email: user.email, userId: user._id};
            res.redirect('/private');
        } else {
            res.redirect('/register');
        }
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// router.post('/register', async (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;
//   const email = req.body.email;
//   try {
//     // Hash the password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Add user to the database
//     const newUser = {
//       username: username.toLowerCase(),
//       email: email.toLowerCase(),
//       hashed_password: hashedPassword,
//       profile_picture: '',
//       uploaded_docs: [],
//       queries: [],
//     };
//     try{
//     await userData.addUser(username, email, hashedPassword); // Add user to DB function
//     }
//     catch(e){
//       if( e.message == 'Username or email already exists.'){
//         res.status(401).json({error: 'Username or email already exists.'})
//       }
//     }
//     const usersCollection = await users();
//     const result = await usersCollection.findOne({username:username})
//     if (result) {
//       res.redirect('/');
//     } else {
//       res.status(400).json({ error: 'Unable to register user.' });
//     }
//   } catch (error) {
//     console.error('Error during registration:', error);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// });


export default router;
