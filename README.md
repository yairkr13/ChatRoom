# 💬 Chatroom Web Application

A simple real-time chatroom built with **Node.js**, **Express.js**, and **EJS**  
Created as part of a university exercise to practice RESTful routing, session-based authentication, and modular server-side development.

---

## 🧩 Project Description

This project demonstrates core concepts of full-stack web development using the Express framework.  
It allows users to register, log in, and send messages in a shared chatroom interface.  
All data is stored locally using the Node.js file system module (`fs`), and the server is built with clean route separation and modular logic.

---

## ✨ Features

- 🧑‍💻 **User Registration & Login** – with validation and secure session management
- 📦 **File-based Data Storage** – no database required
- 🧠 **Modular Code Structure** – routes, views, and logic separated
- 🌐 **Dynamic Views** – rendered using EJS templates
- 🔁 **Real-time Message Display** – via periodic client-side polling
- 🎨 **Responsive UI** – styled with Bootstrap

---

## 🛠️ Technologies Used

- Node.js  
- Express.js  
- EJS (Embedded JavaScript templating)  
- express-session  
- Bootstrap 5  
- File System (fs)  

---

## 📁 Folder Structure

📦 chatroom-express
├── app.js # Main entry point
├── routes/ # Route handlers (home, auth, chat)
├── views/ # EJS template files
├── logic/ # Business logic modules
├── public/ # Static CSS/JS files
└── data/ # JSON storage for users and messages
