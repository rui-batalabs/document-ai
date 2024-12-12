import helper from './helpers.js'
document.addEventListener('DOMContentLoaded', () => {
  // Handle login form submission
  
   // Dynamic Header Logic
   const loginLink = document.getElementById('login-link');
   const logoutLink = document.getElementById('logout-link');
   const profilePicture = document.getElementById('profile-picture');
  
  
  // Function to check login status
  const isLoggedIn = () => Boolean(localStorage.getItem('user'));

  if (isLoggedIn()) {
    loginLink.style.display = 'none';
    logoutLink.style.display = 'inline';
    profilePicture.src = localStorage.getItem('profilePicture') || '/noProfilePicture.jpg';
  } else {
    logoutLink.style.display = 'none';
  }

  // Handle logout action
  if (logoutLink) {
    logoutLink.addEventListener('click', () => {
      localStorage.removeItem('user'); // Clear user session
      localStorage.removeItem('profilePicture');
      alert('You have been logged out.');
      window.location.href = '/';
    });
  }

 // Handle profile picture upload
 const profilePictureForm = document.getElementById('profile-picture-form');
 const profilePictureInput = document.getElementById('profile-picture-upload');
 const uploadStatus = document.getElementById('upload-status');
 const uploadError = document.getElementById('upload-error');

 if (profilePictureForm) {
   profilePictureForm.addEventListener('submit', async (e) => {
     e.preventDefault();

     // Ensure a file is selected
     if (!profilePictureInput.files.length) {
       alert('Please select a file to upload.');
       return;
     }

     // Prepare the file for upload
     const formData = new FormData();
     formData.append('profilePicture', profilePictureInput.files[0]);

     try {
       const response = await fetch('/api/uploadProfilePicture', {
         method: 'POST',
         body: formData,
       });

       if (response.ok) {
         const result = await response.json();

         // Update the profile picture in the DOM
         profilePicture.src = result.profilePictureUrl;
         localStorage.setItem('profilePicture', result.profilePictureUrl);

         // Show success message
         uploadStatus.classList.remove('hidden');
         uploadError.classList.add('hidden');
       } else {
         // Show error message
         uploadStatus.classList.add('hidden');
         uploadError.classList.remove('hidden');
       }
     } catch (error) {
       console.error('Error uploading profile picture:', error);
       uploadStatus.classList.add('hidden');
       uploadError.classList.remove('hidden');
     }
   });
 }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let email = document.getElementById('email').value.trim().toLowerCase();
      let password = document.getElementById('password').value;

      

      try {
        email = helper.emailCheck(email);
        password = helper.passwordCheck(password);
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email:email, password:password }),
        });

		if (response.ok) {
          // Redirect to the private page if successful
          window.location.href = '/profile';
        } else if (response.status === 401) {
          // Handle invalid credentials
          alert('Invalid email or password. Please try again.');
        } else {
          alert('An error occurred. Please try again later.');
        }
       
        if (response.redirected) {
          window.location.href = response.url; // Redirect to private or register page
        } else {
          alert('Login failed. Please check your email and password.');
        }
      }
      catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred. Please try again.');
      }})}
    


  const forgotPasswordForm = document.getElementById('forgotForm');
    if(forgotPasswordForm){
      forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let password = document.getElementById('forgotPasswordChange').value;
        let confirmPassword = document.getElementById('confirmPasswordChange').value;
        try{
          password = helper.passwordCheck(password);
          confirmPassword = helper.passwordCheck(confirmPassword);

          if(password!==confirmPassword) throw 'These passwords are not matching';
          const response = await fetch('/passwordreset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password:password, confirmPassword:confirmPassword }),
          });

      if (response.ok) {

            // Redirect to the homepage after successful registration
            alert('Password change successful! Redirecting to the homepage.');
            window.location.href = '/';
          }
          else if (response.status === 400) {
            alert('Password change failed. Please try again.');
          } else {
            alert('An error occurred. Please try again later.');
          }


      }catch(e){
        console.error('Error changing password:', e.message);
          alert(e.message);
      }
      })
      }







  // Handle registration form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let username = document.getElementById('username').value.trim().toLowerCase();
      let email = document.getElementById('email').value.trim().toLowerCase();
      let password = document.getElementById('password').value;
      let confirmPassword = document.getElementById('confirmPassword').value;

      
      try {

        username = helper.usernameCheck(username);
        email = helper.emailCheck(email);
        password = helper.passwordCheck(password);
        confirmPassword = helper.passwordCheck(confirmPassword);

        if(!password ===confirmPassword){
          throw 'These passwords are not the same. Please try again.'
        }

        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username:username, email:email, password:password }),
        });

		if (response.ok) {

          // Redirect to the homepage after successful registration
          alert('Registration successful! Redirecting to the homepage.');
          window.location.href = '/';
        }
         else if (response.status === 400) {
          alert('Registration failed. Please try again with unique credentials.');
        } else {
          alert('An error occurred. Please try again later.');
        }
     
  
        if (response.redirected) {
          window.location.href = response.url; // Redirect to homepage or appropriate page
        } else {
          alert('Registration failed. Please try again with a unique username.');
        }
      } 
     
      catch (error) {
        console.error('Error registering:', error.message);
        alert('An error occurred. Please try again.');
      }
    });
  };

// const profile = document.getElementById("profile");
// if(profile){
//   let username = 

//I can do this at some point need to create session cookie with mongodb id possibly to get user info




// }

});