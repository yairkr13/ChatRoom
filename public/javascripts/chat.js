document.getElementById("chat-form").addEventListener("submit", function(e) {
    e.preventDefault(); // מונע את שליחת הטופס

    let message = document.getElementById("message").value; // מקבל את ההודעה
    if (message.trim() !== "") {
        let chatBox = document.getElementById("chat-box"); // אזור הצ'אט
        let newMessage = document.createElement("p"); // יצירת אלמנט חדש להודעה
        newMessage.textContent = "<%= user.firstName %>: " + message; // הצגת ההודעה עם שם המשתמש
        chatBox.appendChild(newMessage); // הוספת ההודעה לאזור הצ'אט

        document.getElementById("message").value = ""; // ריקון שדה ההודעה לאחר שליחה
    }
});
