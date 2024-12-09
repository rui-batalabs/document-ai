
import {Router} from 'express'
import {users} from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js'

const router = Router();

router.route('/').get((req, res) => {
    //password change while being signed in
    //if(!req.session || !req.session.user){
    //     res.redirect('/home');
    //     }
    // else{
    //     res.render('passwordReset', {title:'Password Reset'});
    // }



})
.post(async (req,res)=> {
    //submitting the 
    //if(!req.session || !req.session.user){
    //     res.redirect('/home');
    //     }
    // else{
    //     const newPassword = helper.passwordCheck(req.body.password);
    //     const confirmPassword = helper.passwordCheck(req.body.confirmPassword);
    //     const email = helper.emailCheck(req.session.user.email);

        

    ////Logic to add new password to the database
    ////need to write client side js to accept and check + compare the passwords
    ////res.redirect to the dashboard once password has been changed with alert that the password has
    ////been successfully been changed



    // }



});


router.route('/:token').get((req,res) => {
    //req.params.token;
    //confirm this link has a valid token, if not give aler that it isnt a valid token and send to homepage
    //then update token and remove token in the post route when the password has been successfully changed
    //also need to ad a forgot password route that sends email with link as localhost/passwordreset/token


})
.post(async (req, res) => {





})



export default router;