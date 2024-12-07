
import { Router } from 'express';
const router = Router();

router.get('/', (req, res)=>{
    if(!req.session.user){
        res.redirect('/')
    }
    else{
        req.session.destroy();
        res.clearCookie('cookieKey')
        res.render('signoutuser', {title:"Sign-out", themePreference:"default"})}
    }
)

export default router;