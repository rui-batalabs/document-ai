import { Router } from 'express';
import usersRoute from './users.js';
import privateRoute from './private.js';
import registerRoute from './register.js';
import profileRoute from  './profile.js'
import signoutRoute from './signout.js'

const router = Router();

router.use('/', usersRoute);
router.use('/private', privateRoute);
router.use('/register', registerRoute);
router.use('/private/profile', profileRoute);
router.use('/signout', signoutRoute);

export default router;
