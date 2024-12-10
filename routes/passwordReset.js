
import {Router} from 'express'
import {users} from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js'
import {userData} from '../data/index.js'
import { tokenData } from '../data/index.js';

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
        // try{
    //     const newPassword = helper.passwordCheck(req.body.password);
    //     const confirmPassword = helper.passwordCheck(req.body.confirmPassword);
    //     const email = helper.emailCheck(req.session.user.email);
    //     if(newPassword!==confirmPassword)throw 'These passwords do not match'
            // const updatedUser = await userData.changeUserPassword(email, newPassword, confirmPassword);
            // alert('Successful password change');
            // res.redirect('/dashboard')
        // }
        // catch(e){
        //     res.status(500).send('Internal server error');
        // }
    ////Logic to add new password to the database
    ////COMPLETED *** need to write client side js to accept and check + compare the passwords
    ////res.redirect to the dashboard once password has been changed with alert that the password has
    ////been successfully been changed



    // }



});
router.route('/forgotPassword').get((req,res) => {
    //sends user to page where they can submit email,
    //if valid email, an email will be sent to the user, if not nothing will happen for security reasons
    // a message displaying that if email valid an email has been sent
    //if(req.session || req.session.user){
    //     res.redirect('/dashboard');
    //     }
    // else{
    //  try{
    //     res.render('forgotPassword', {title:'Forgot Password'}}); //***********************create */
    // } catch (e) {
    //     console.error('Error loading forgot password page:', e);
    //     res.status(500).send('Internal Server Error');
    // }
    //
    // }


})
.post(async (req, res)=>{ // need to make client side script for this to accept only email
    //accepts the email then 
     //if(req.session || req.session.user){
    //     res.redirect('/dashboard');
    //     }
    
    //
    // else{
    //     const email = helper.emailCheck(req.body.email);
    //     const userCollection = await users();
    //     const user = await userCollection.find({email:email});
    //     if(user){
    //         const token = tokenData.createToken(email);
    //         if(!token) throw 'Forgot password token failed'
            
    //         // I need to figure out how to sendemail localhost:$port/passwordreset/token
    //         res.redirect('/home')
    //     }
    // }

})

router.route('/:token').get((req,res) => {
    //req.params.token;
    //confirm this link has a valid token, if not give aler that it isnt a valid token and send to homepage
    //then update token and remove token in the post route when the password has been successfully changed
    //also need to ad a forgot password route that sends email with link as localhost/passwordreset/token


})
.post(async (req, res) => {





})



export default router;