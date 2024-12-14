import helper from './helpers.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@latest/dist/purify.es.min.js'; 

 //CHECKS EMAIL
 const forgotEmailForm = document.getElementById('forgotEmailForm');
 if(forgotEmailForm){
    forgotEmailForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     let email = document.getElementById('email').value;
     try{
       email = DOMPurify.sanitize(helper.emailCheck(email));

       const response = await fetch('/passwordreset/forgotPassword', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email:email}),
       });
       if (response.ok) {
         alert('Email sent! Redirecting to the homepage.');
         window.location.href = '/';
       } else if (response.status === 400) {
         alert('Email send failed. Please try again.');
       } else {
         alert('An error occurred. Please try again later.');
       }
     }

   catch(e){
     console.error('Error ending forgot password email:', e.message);
     alert(e);
   }
   })
 }




//CHECKS RESET PASSWORD THIS IS IF SIGNED IN
 const resetPasswordForm = document.getElementById('resetForm');
 if(resetPasswordForm){
   resetPasswordForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     let password = document.getElementById('password').value;
     let confirmPassword = document.getElementById('confirmPassword').value;

     try{
       password = DOMPurify.sanitize(helper.passwordCheck(password));
       confirmPassword = DOMPurify.sanitize(helper.passwordCheck(confirmPassword));

       if (password !== confirmPassword) throw 'These passwords are not matching';
       const response = await fetch('/passwordreset', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ password: password, confirmPassword: confirmPassword }),
       });
       if (response.ok) {
         alert('Password change successful! Redirecting to the homepage.');
         window.location.href = '/';
       } else if (response.status === 400) {
         alert('Password change failed. Please try again.');
       } else {
         alert('An error occurred. Please try again later.');
       }

     } catch (e) {
       console.error('Error changing password:', e.message);
       alert(e);
     }
     }


   )}
 
   //CHECKS PASSWORD RESET IF NOT SIGNED IN FROM FORGOT YOUR PASSWORD
 const forgotPasswordForm = document.getElementById('forgotForm');
 if (forgotPasswordForm) {
   console.log("here")
   forgotPasswordForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     let password = document.getElementById('password').value;
     let confirmPassword = document.getElementById('confirmPassword').value;
     let path = window.location.pathname;
     let token = path.substring(15)
     console.log(token)
     
     try {
       token = DOMPurify.sanitize(helper.tokenCheck(token));
       password = DOMPurify.sanitize(helper.passwordCheck(password));  // Sanitize password
       confirmPassword = DOMPurify.sanitize(helper.passwordCheck(confirmPassword));  // Sanitize password

       if (password !== confirmPassword) throw 'These passwords are not matching';
       let path = `/passwordreset/${token}`
       console.log(path)
       const response = await fetch(path, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ password: password, confirmPassword: confirmPassword }),
       });

       if (response.ok) {
         alert('Password change successful! Redirecting to the homepage.');
         window.location.href = '/';
       } else if (response.status === 400) {
         alert('Password change failed. Please try again.');
       } else {
         alert('An error occurred. Please try again later.');
       }

     } catch (e) {
       console.error('Error changing password:', e.message);
       alert(e);
     }
   })
 }