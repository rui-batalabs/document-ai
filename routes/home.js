import {Router} from 'express';

const router = Router();

/**
 * GET /
 * Home route to display the homepage.
 * Redirects authenticated users to the private page.
 */
router.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile('static/home.html', {root: '.'});
});

export default router;
