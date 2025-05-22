document.addEventListener('DOMContentLoaded', function () {
  // הטענת ערכים לטופס ההרשמה אם קיימים בקוקיז
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const emailInput = document.getElementById('email');

  // טופס הרשמה
  const registerForm = document.getElementById('registerForm');
  const continueBtn = document.getElementById('continue-btn');

  if (registerForm && continueBtn) {
    continueBtn.addEventListener('click', function () {
      const firstName = firstNameInput.value.trim();
      const lastName = lastNameInput.value.trim();
      const email = emailInput.value.trim();
      let isValid = true;

      // ניקוי הודעות קודמות
      document.getElementById('firstNameError').innerText = '';
      document.getElementById('lastNameError').innerText = '';
      document.getElementById('emailError').innerText = '';

      // בדיקות תקינות
      if (!/^[a-zA-Z]{3,32}$/.test(firstName)) {
        isValid = false;
        document.getElementById('firstNameError').innerText = 'First name should be 3-32 letters only';
      }

      if (!/^[a-zA-Z]{3,32}$/.test(lastName)) {
        isValid = false;
        document.getElementById('lastNameError').innerText = 'Last name should be 3-32 letters only';
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        isValid = false;
        document.getElementById('emailError').innerText = 'Please enter a valid email address';
      }

      if (!isValid) return;
      // שליחה
      registerForm.submit();
    });
  }

  // טופס סיסמה
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function (event) {
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      const passwordError = document.getElementById('passwordError');
      const confirmPasswordError = document.getElementById('confirmPasswordError');

      let isValid = true;

      passwordError.innerText = '';
      confirmPasswordError.innerText = '';

      if (password.length < 3 || password.length > 32) {
        isValid = false;
        passwordError.innerText = 'Password should be 3-32 characters';
      }

      if (password !== confirmPassword) {
        isValid = false;
        confirmPasswordError.innerText = 'Passwords do not match';
      }

      if (!isValid) {
        event.preventDefault();
      }
    });
  }
});
