
import helper from './helpers.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@latest/dist/purify.es.min.js';  // Import DOMPurify for sanitization

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
    profilePicture.src = DOMPurify.sanitize(localStorage.getItem('profilePicture') || '/noProfilePicture.jpg');  // Sanitize URL
  } else {
    //logoutLink.style.display = 'none';
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

      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5 MB

      if (!allowedTypes.includes(profilePictureInput.files[0].type)) {
        alert('Please upload a valid image file (JPEG/PNG).');
        return;
      }
      if (profilePictureInput.files[0].size > maxSize) {
        alert('File size exceeds the 5 MB limit.');
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

          // Sanitize the profile picture URL before updating the DOM
          profilePicture.src = DOMPurify.sanitize(result.profilePictureUrl);
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
 // Handle registration form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let email = document.getElementById('email').value.trim().toLowerCase();
      let password = document.getElementById('password').value;
      let confirmPassword = document.getElementById('confirmPassword').value;

       // Validate email and password
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(email)) {
         alert('Please enter a valid email address.');
         return;
       }
       if (password.length < 8) {
         alert('Password must be at least 8 characters long.');
         return;
       }
       if (password !== confirmPassword) {
         alert('Passwords do not match.');
         return;
       }
      
      
      try {
        email = DOMPurify.sanitize(helper.emailCheck(email));  // Sanitize email
        password = DOMPurify.sanitize(helper.passwordCheck(password));  // Sanitize password
        confirmPassword = DOMPurify.sanitize(helper.passwordCheck(confirmPassword));  // Sanitize password
        if (password !== confirmPassword) {
          throw 'These passwords are not the same. Please try again.';
        }
        //Password2016%
        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password, confirmPassword:confirmPassword }),
        });
        
        if (response.ok) {
          alert('Registration successful! Redirecting to the login.');
          window.location.href = '/signin';
        } 
        else{
          const responseData = await response.json();
          if(responseData){
            alert(responseData.error);
          }
          else{
            throw 'Account not Successfully created';
          }
        }
      }
      catch (error) {
        console.error('Error registering:', error);
        alert('Error: ' + error);
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let email = document.getElementById('email').value.trim().toLowerCase();
      let password = document.getElementById('password').value;

       // Validate email
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(email)) {
         alert('Please enter a valid email address.');
         return;
       }
      
      try {
        email = DOMPurify.sanitize(helper.emailCheck(email));  // Sanitize email
        password = DOMPurify.sanitize(helper.passwordCheck(password));  // Sanitize password
        
        const response = await fetch('/passwordreset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password, confirmPassword: confirmPassword }),
        });

        if (response.ok) {
          // Redirect to the private page if successful
          window.location.href = '/signin';
        } else if (response.status === 401) {
          // Handle invalid credentials
          alert('Invalid password. Please try again.');
        } else {
          alert('An error occurred. Please try again later.');
        }

        if (response.redirected) {
          window.location.href = response.url; // Redirect to private or register page
        } else {
          alert('Reset failed. Please check your passwords.');
        }
      }

      catch (error) {
        console.error('Error reseting password in:', error);
        alert('An error occurred. Please try again.');
      }
    })
  }

 
  
 
});
