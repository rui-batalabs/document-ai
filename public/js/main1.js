
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

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let email = document.getElementById('email').value.trim().toLowerCase();
      let password = document.getElementById('password').value;

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

  //CHECKS EMAIL
  const forgotEmailForm = document.getElementById('forgotEmailForm');
  if(forgotEmailForm){
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let email = document.getElementById('email');

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
        alert(e.message);
      }
      }


    )}
  
    //CHECKS PASSWORD RESET IF NOT SIGNED IN FROM FORGOT YOUR PASSWORD
  const forgotPasswordForm = document.getElementById('forgotForm');
  if (forgotPasswordForm) {
    console.log("here")
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let password = document.getElementById('forgotPasswordChange').value;
      let confirmPassword = document.getElementById('confirmPasswordChange').value;
      let path = window.location.pathname;
      let token = path.substring(29)
      
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
          body: JSON.stringify({ password: password, confirmPassword: confirmPassword, test:"uhoh" }),
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
        alert(e.message);
      }
    })
  }
  //Generate particles
  particlesJS('particles-js', {
    particles: {
      number: {
        value: 100, // Number of particles
        density: { enable: true, value_area: 800 } // Density of particles
      },
      color: {
        value: '#ffffff' // Particle color (white)
      },
      shape: {
        type: 'circle', // Particle shape
        stroke: { width: 0, color: '#000000' } // No stroke
      },
      opacity: {
        value: 0.5, // Particle opacity
        random: true, // Random opacity for particles
        anim: { enable: true, speed: 1, opacity_min: 0 } // Animation for opacity
      },
      size: {
        value: 3, // Size of the particles
        random: true, // Random size for particles
        anim: { enable: true, speed: 5, size_min: 0.1 } // Animation for particle size
      },
      line_linked: {
        enable: true, // Enable lines between particles
        distance: 150, // Distance between particles to form a line
        color: '#ffffff', // Line color (white)
        opacity: 0.4, // Line opacity
        width: 1 // Line width
      },
      move: {
        enable: true, // Enable particle movement
        speed: 2, // Speed of particle movement
        direction: 'random', // Random movement direction
        random: true, // Random movement pattern
        straight: false, // No straight-line movement
        out_mode: 'out', // Particles will exit the screen when they move out
        bounce: false // No bounce when particles hit edges
      }
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: 'repulse' } // Interactivity: particles repel on hover
      }
    },
    retina_detect: true // Detect high DPI screens and adjust particles accordingly
  });
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
        username = DOMPurify.sanitize(helper.usernameCheck(username));  // Sanitize username
        email = DOMPurify.sanitize(helper.emailCheck(email));  // Sanitize email
        password = DOMPurify.sanitize(helper.passwordCheck(password));  // Sanitize password
        confirmPassword = DOMPurify.sanitize(helper.passwordCheck(confirmPassword));  // Sanitize password

        if (password !== confirmPassword) {
          throw 'These passwords are not the same. Please try again.';
        }

        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username, email: email, password: password }),
        });

        if (response.ok) {
          alert('Registration successful! Redirecting to the homepage.');
          window.location.href = '/';
        } else if (response.status === 400) {
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
  }
});
