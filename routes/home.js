import {Router} from 'express';

const router = Router();

/**
 * GET /
 * Home route to display the homepage.
 * Redirects authenticated users to the private page.
 */
router.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/private');
    }
    res.sendFile('static/homepage.html', {root: '.'});
});

export default router;
