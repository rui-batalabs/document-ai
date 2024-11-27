import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  if (req.session.user) {
    res.render('mainUserPage', {title: 'Main Page', username: req.session.user.username});
  } else {
    res.redirect('/');
  }
});

export default router;
