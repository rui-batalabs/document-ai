function initializeRegisterFormValidation() {
    const form = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    if (!form) {
        console.error("Register form not found on the page.");
        return;
    }

    form.addEventListener('submit', (e) => {
        let isValid = true;

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailError.classList.remove('hidden');
            isValid = false;
        } else {
            emailError.classList.add('hidden');
        }

        // Password Validation
        if (passwordInput.value.length < 8) {
            passwordError.classList.remove('hidden');
            isValid = false;
        } else {
            passwordError.classList.add('hidden');
        }

        // Confirm Password Validation
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.classList.remove('hidden');
            isValid = false;
        } else {
            confirmPasswordError.classList.add('hidden');
        }

        // Prevent form submission if validation fails
        if (!isValid) {
            e.preventDefault();
        }
    });
}

// Call the register form validation function
initializeRegisterFormValidation();
