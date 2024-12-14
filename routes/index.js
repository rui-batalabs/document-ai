import { Router } from 'express';
import homeRoute from './home.js';
import signinRoute from './signin.js';
import registerRoute from './register.js';
import avatarsRoute from './avatars.js';
import signoutRoute from './signout.js';
import dashboardRoute from './dashboard.js';
import passwordResetRoute from './passwordReset.js';
import chatRoute from './chat.js';

const router = Router();

// Routes
router.use('/', homeRoute);
router.use('/signin', signinRoute);
router.use('/dashboard', dashboardRoute);
router.use('/register', registerRoute);
router.use('/avatars', avatarsRoute);
router.use('/signout', signoutRoute);
router.use('/passwordreset', passwordResetRoute);
router.use('/chat', chatRoute);

export default router;
