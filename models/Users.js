'user strict';

const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = (sequelize) => {
    class User extends Model {
        async hashPassword() {
            if (!this.password) return; // אם אין סיסמה, לא להצפין
            try {
                const salt = await bcrypt.genSalt(saltRounds);
                this.password = await bcrypt.hash(this.password, salt);
            } catch (e) {
                console.log("Error hashing password:", e.message);
                throw new Error('Failed to hash password');
            }
        }

        async comparePassword(pass) {
            console.log("🔍 בודק סיסמה:", pass, "מול:", this.password);
            return bcrypt.compare(pass, this.password);
        }
    }

    User.init({
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: "Email is already registered."
            },
            validate: {
                isEmail: { msg: "Invalid email format." },
                notEmpty: { msg: "Email cannot be empty." }
            }
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "First name cannot be empty." },
                len: { args: [2, 50], msg: "First name must be between 2 to 50 characters." }
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Last name cannot be empty." },
                len: { args: [2, 50], msg: "Last name must be between 2 to 50 characters." }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,  // אפשר להכניס משתמש ללא סיסמה בהתחלה
            validate: {
                len: { args: [4, 20], msg: "Password length must be between 4 to 20 characters." }
            }
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "user"
        }
    }, {
        sequelize,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {  // הצפנת סיסמה רק אם קיימת
                    await user.hashPassword();
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password') && user.password) {  // הצפנה רק אם הסיסמה השתנתה
                    await user.hashPassword();
                }
            }
        },
        modelName: 'User'
    });

    return User;
};
