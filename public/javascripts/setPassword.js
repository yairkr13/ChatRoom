document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("password-form");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const errorDiv = document.getElementById("password-error");

    form.addEventListener("submit", function (event) {
        // אם הסיסמאות לא תואמות
        if (passwordInput.value !== confirmPasswordInput.value) {
            event.preventDefault(); // מונע שליחת הטופס
            errorDiv.textContent = "❌ Passwords do not match."; // מציג את הודעת השגיאה
            errorDiv.classList.remove("d-none"); // מציג את ההודעה
        }
        // אם הסיסמא קצרה מדי
        else if (passwordInput.value.length < 4) {
            event.preventDefault(); // מונע שליחת הטופס
            errorDiv.textContent = "❌ Password must be at least 4 characters long."; // הודעת שגיאה על אורך הסיסמא
            errorDiv.classList.remove("d-none"); // מציג את ההודעה
        } else {
            errorDiv.classList.add("d-none"); // מסתיר את ההודעה אם הסיסמאות תואמות
            errorDiv.textContent = ""; // מסיר את הטקסט מההודעה
        }
    });
});
