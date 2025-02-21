'use strict';

const bcrypt = require('bcrypt');
const db = require("../models");

module.exports = {

    async validateUserAccess(email, pass) {
        try {
            const user = await db.User.findOne({ where: { email } });
            if (!user) {
                throw new Error("Invalid email or password.");
            }

            const isPasswordCorrect = await bcrypt.compare(pass, user.password);
            if (!isPasswordCorrect) {
                throw new Error("Invalid email or password.");
            }

            return user;
        } catch (error) {
            throw error;
        }
    },

    async login(req, res) {
        const { email, password } = req.body;
        console.log("📩 Login attempt with:", email);

        try {
            const user = await module.exports.validateUserAccess(email, password);
            console.log("✅ User found:", user.email);

            req.session.loggedIn = true;
            req.session.user = { id: user.id, firstName: user.firstName, lastName: user.lastName };
            console.log("🔑 Login successful! Redirecting to /chat...");

            return res.redirect('/chat');

        } catch (e) {
            console.log("❌ Login error:", e.message);
            return res.status(401).render('login', {
                errors: { login: "Invalid email or password." },
                formData: { email }
            });
        }
    },

    logOut(req, res) {
        console.log("Before destroying session:", req.session);
        req.session.destroy((err) => {
            console.log("Session deletion completed");
            if (err) {
                console.log("Error destroying session:", err);
                return res.status(500).render('error', { message: 'Error logging out. Please try again.' });
            }
            console.log("User logged out, redirecting to the home page...");
            res.redirect('/');
        });
    },

    async renderRegisterPage(req, res) {
        res.render('register', { error: req.flash('error') });
    },

// בתוך פונקציית ה- register:

    async register(req, res) {
        const { email, firstName, lastName } = req.body;

        // וולידציה של האימייל לפני המשך הרשמה
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            return res.status(400).render('register', {
                errors: { email: "Invalid email format." },
                formData: req.body
            });
        }

        try {
            const existingUser = await db.User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).render('register', {
                    errors: { email: "Email is already registered." },
                    formData: req.body
                });
            }

            // אם כל הבדיקות תקינות, נשמור את הנתונים בעוגיית session
            res.cookie('registerData', JSON.stringify({ email, firstName, lastName }), { maxAge: 30000, httpOnly: true });
            return res.redirect('/users/set-password');
        } catch (e) {
            console.error("Registration error:", e);
            return res.status(500).render('error');
        }
    }
,

    async renderSetPasswordPage(req, res) {
        const registerData = req.cookies.registerData ? JSON.parse(req.cookies.registerData) : null;
        const email = registerData ? registerData.email : null;

        if (!email) {
            return res.redirect('/register');
        }

        return res.render('setPassword', { email });
    },

    async setPassword(req, res) {
        try {
            const registerData = req.cookies.registerData ? JSON.parse(req.cookies.registerData) : null;

            if (!registerData || !registerData.email || !registerData.firstName || !registerData.lastName) {
                console.error("Missing registerData:", registerData);
                return res.redirect('/register');
            }

            const { email, firstName, lastName } = registerData;
            const { password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                return res.status(400).render('setPassword', {
                    email,
                    errors: { password: "Passwords do not match." }
                });
            }

            if (password.length < 4 || password.length > 20) {
                return res.status(400).render('setPassword', {
                    email,
                    errors: { password: "Password length must be between 4 to 20 characters." }
                });
            }

            // יצירת משתמש חדש
            await db.User.create({ email, firstName, lastName, password });

            res.clearCookie('registerData');
            console.log("User registered successfully:", email);
            return res.redirect('/?success=registered');
        } catch (e) {
            console.error("Error in setPassword:", e);
            return res.status(500).render('error', { error: e.message });
        }
    }
};