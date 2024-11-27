import { Router } from 'express';
const router = Router();

router.get('/', (req, res)=>{
    if(req.session.user){
    res.render('profile', {title: 'Profile', user: req.session.user});
    }
    else{
        res.redirect('/');
    }

})
export default router;