import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  if (req.session.user) {
    res.sendFile('static/privatepage.html', { root: '.' });
  } else {
    res.redirect('/');
  }
});

export default router;
