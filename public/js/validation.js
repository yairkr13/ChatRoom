document.addEventListener('DOMContentLoaded', function () {
  // Registration form validation
  const registerForm = document.getElementById('registerForm');
  const continueBtn = document.getElementById('continue-btn');

  if (registerForm && continueBtn) {
    // Listen for click on "Continue" button in registration form
    continueBtn.addEventListener('click', function () {
      const firstNameInput = document.getElementById('firstName');
      const lastNameInput = document.getElementById('lastName');
      const emailInput = document.getElementById('email');

      const firstNameError = document.getElementById('firstNameError');
      const lastNameError = document.getElementById('lastNameError');
      const emailError = document.getElementById('emailError');

      // Trim input values
      const firstName = firstNameInput.value.trim();
      const lastName = lastNameInput.value.trim();
      const email = emailInput.value.trim();

      let isValid = true;

      // Reset previous error messages
      firstNameError.innerText = '';
      lastNameError.innerText = '';
      emailError.innerText = '';

      // Validate first name - must be 3-32 letters only
      if (!/^[a-zA-Z]{3,32}$/.test(firstName)) {
        firstNameError.innerText = 'First name should be 3-32 letters only';
        isValid = false;
      }

      // Validate last name - must be 3-32 letters only
      if (!/^[a-zA-Z]{3,32}$/.test(lastName)) {
        lastNameError.innerText = 'Last name should be 3-32 letters only';
        isValid = false;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.innerText = 'Please enter a valid email address';
        isValid = false;
      }

      // Submit form if valid
      if (isValid) {
        registerForm.submit();
      }
    });
  }

  // Password form validation
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    // Listen for submit event on password form
    passwordForm.addEventListener('submit', function (event) {
      const passwordInput = document.getElementById('password');
      const confirmPasswordInput = document.getElementById('confirmPassword');

      const passwordError = document.getElementById('passwordError');
      const confirmPasswordError = document.getElementById('confirmPasswordError');

      const password = passwordInput.value.trim();
      const confirmPassword = confirmPasswordInput.value.trim();

      let isValid = true;

      // Reset error messages
      passwordError.innerText = '';
      confirmPasswordError.innerText = '';

      // Validate password length (3-32 characters)
      if (password.length < 3 || password.length > 32) {
        passwordError.innerText = 'Password should be 3-32 characters';
        isValid = false;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        confirmPasswordError.innerText = 'Passwords do not match';
        isValid = false;
      }

      // Prevent form submission if invalid
      if (!isValid) {
        event.preventDefault();
      }
    });
  }

  // Login form validation
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Listen for submit event on login form
    loginForm.addEventListener('submit', function (e) {
      // Prevent default submission to run validation first
      e.preventDefault();

      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const emailError = document.getElementById('emailError');
      const passwordError = document.getElementById('passwordError');

      const emailVal = emailInput.value.trim();
      const passwordVal = passwordInput.value.trim();

      let isValid = true;

      // Reset error messages
      emailError.innerText = '';
      passwordError.innerText = '';

      // Validate email presence and format
      if (emailVal === '') {
        emailError.innerText = 'Email is required.';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        emailError.innerText = 'Please enter a valid email address.';
        isValid = false;
      }

      // Validate password presence
      if (passwordVal === '') {
        passwordError.innerText = 'Password is required.';
        isValid = false;
      }

      // Submit form if valid
      if (isValid) {
        loginForm.submit();
      }
    });
  }
});
