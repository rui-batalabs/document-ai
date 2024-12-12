
import {Router} from 'express'
import {passwordTokens, users} from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js'
import {userData} from '../data/index.js'
import { tokenData } from '../data/index.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

const router = Router();

router.route('/').get((req, res) => {
    //password change while being signed in
    if(!req.session || !req.session.user){
        res.redirect('/home');
        }
    else{
        res.render('passwordReset', {title:'Password Reset'});
    }



})
.post(async (req,res)=> {
    //submitting the 
    if(!req.session || !req.session.user){
        res.redirect('/home');
        }
    else{
        try{
        const newPassword = helper.passwordCheck(req.body.password);
        const confirmPassword = helper.passwordCheck(req.body.confirmPassword);
        const email = helper.emailCheck(req.session.user.email);
        if(newPassword!==confirmPassword)throw 'These passwords do not match'
        const updatedUser = await userData.changeUserPassword(email, newPassword, confirmPassword);
        res.redirect('/dashboard')
        }
        catch(e){
            res.status(500).send('Internal server error');
        }
    ////Logic to add new password to the database
    ////COMPLETED *** need to write client side js to accept and check + compare the passwords
    ////res.redirect to the dashboard once password has been changed with alert that the password has
    ////been successfully been changed

    }
});

router.route('/forgotPassword').get((req,res) => {
    //sends user to page where they can submit email,
    //if valid email, an email will be sent to the user, if not nothing will happen for security reasons
    // a message displaying that if email valid an email has been sent
    if(req.session || req.session.user){
        res.redirect('/dashboard');
        }
    else{
     try{
        res.render('forgotPassword', {title:'Forgot Password'}); //***********************create */
    } catch (e) {
        console.error('Error loading forgot password page:', e);
        res.status(500).send('Internal Server Error');
    }
    
    }


})
.post(async (req, res)=>{ // need to make client side script for this to accept only email
                //accepts the email then 
     if(req.session || req.session.user){
        res.redirect('/dashboard');
        }
    
    
    else{
        try{
            dotenv.config();
        const email = helper.emailCheck(req.body.email);
        const userCollection = await users();
        const user = await userCollection.find({email:email});
        if(user){
            const token = tokenData.createToken(email);
            if(!token) throw 'Forgot password token failed'
                const transporter = nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD
                    }
                });
                const info = await transporter.sendMail({
                    from: process.env.EMAIL, 
                    to:email,
                    subject:'Forgot Password',
                    html: '<p>Click <a href="http://localhost:3000/resetpassword/' + token + '">here</a> to reset your password</p>'
                })
            if(!info)throw 'Message failed to send';
        }
            
            res.redirect('/home')
           }

            
            catch(e){
                console.error('Error sending forgot email page', e);
                res.status(500).send('Internal Server Error');
            }
        }

})

router.route('/:token').get(async (req,res) => {
    //req.params.token;
    //confirm this link has a valid token, if not give aler that it isnt a valid token and send to homepage
    //then update token and remove token in the post route when the password has been successfully changed
    //also need to ad a forgot password route that sends email with link as localhost/passwordreset/token
    if(req.session || req.session.user){
        res.redirect('/dashboard');
        }
    try{
        const token = req.params.token;
        token = helper.tokenCheck(token);
        const updateToken = await tokenData.accessedToken(token);
        if(!updateToken) throw 'Error confirming token';
        res.render('passwordReset', {title:'Password Reset'});
    }
    catch(e){
        console.error('Error with token page', e);
        res.status(500).send('Internal Server Error');
    }
    
})
.post(async (req, res) => {
    if(req.session || req.session.user){
        res.redirect('/dashboard');
        }
    try{
        const password = helper.passwordCheck(req.body.password);
        const confirmPassword = helper.passwordCheck(req.body.confirmPassword);
        if(password!==confirmPassword)throw 'These passwords do not match'
        const token = req.params.token;
        token = helper.tokenCheck(token);
        const email = helper.emailCheck(await passwordTokens().find({token:token}).email)
        const updatedUser = await userData.changeUserPassword(email, password, confirmPassword);

    }
    catch(e){
        console.error('Error posting new password with token', e);
        res.status(500).send('Internal Server Error');
    }
    


})



export default router;