// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Sanitize input values using DOMPurify
    const email = DOMPurify.sanitize(document.getElementById('email').value.trim().toLowerCase());
    const password = DOMPurify.sanitize(document.getElementById('password').value);

    try {
      const response = await fetch('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Redirect to the private page if successful
        window.location.href = '/private';
      } else if (response.status === 401) {
        // Handle invalid credentials
        alert('Invalid email or password. Please try again.');
      } else {
        alert('An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again later.');
    }

    try {
      if (response.redirected) {
        window.location.href = response.url; // Redirect to private or register page
      } else {
        alert('Login failed. Please check your email and password.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred. Please try again.');
    }
  });
}

// Handle registration form submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Sanitize input values using DOMPurify
    const username = DOMPurify.sanitize(document.getElementById('username').value.trim().toLowerCase());
    const email = DOMPurify.sanitize(document.getElementById('email').value.trim().toLowerCase());
    const password = DOMPurify.sanitize(document.getElementById('password').value);

    try {
      const response = await fetch('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        // Redirect to the homepage after successful registration
        alert('Registration successful! Redirecting to the homepage.');
        window.location.href = '/';
      } else if (response.status === 400) {
        alert('Registration failed. Please try again with unique credentials.');
      } else {
        alert('An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred. Please try again later.');
    }

    try {
      if (response.redirected) {
        window.location.href = response.url; // Redirect to homepage or appropriate page
      } else {
        alert('Registration failed. Please try again with a unique username.');
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('An error occurred. Please try again.');
    }
  });
};
