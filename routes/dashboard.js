import {Router} from 'express';
import path from 'path';

const router = Router();

/**
 * GET /private
 * Serves the dashboard page for authenticated users.
 */
router.get('/', (req, res) => {
    if (!req.session || !req.session.user) {
        // Redirect to sign-in if the user is not authenticated
        return res.redirect('/signin');
    }

    res.sendFile(path.resolve('static/dashboard.html'));
});

export default router;
