
document.addEventListener('DOMContentLoaded', () => {
  // Handle login form submission
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;

      try {
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
    
  

  // Handle registration form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim().toLowerCase();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;

      
      try {
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