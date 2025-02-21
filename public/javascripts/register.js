document.getElementById("register-form").addEventListener("submit", function(event) {
    const emailInput = document.getElementById("email");
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(emailInput.value)) {
        event.preventDefault(); // מונע שליחת הטופס
        alert("Please enter a valid email address."); // הצגת הודעת שגיאה
        emailInput.classList.add('is-invalid'); // סימון השדה באדום
    }
});