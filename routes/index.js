import {Router} from 'express';
import homeRoute from './home.js';
import signinRoute from './signin.js';
import privateRoute from './private.js';
import registerRoute from './register.js';
import profileRoute from './profile.js';
import signoutRoute from './signout.js';
import dashboardRoute from './dashboard.js';

const router = Router();

// Routes
router.use('/', homeRoute);
router.use('/signin', signinRoute);
router.use('/dashboard', dashboardRoute);
router.use('/register', registerRoute);
router.use('/private/profile', profileRoute);
router.use('/signout', signoutRoute);

export default router;
