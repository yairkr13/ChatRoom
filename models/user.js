'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: { args: [3, 32], msg: 'First name should be 3-32 letters only' },
          is: { args: /^[a-zA-Z]+$/, msg: 'First name must contain only letters' }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: { args: [3, 32], msg: 'Last name should be 3-32 letters only' },
          is: { args: /^[a-zA-Z]+$/, msg: 'Last name must contain only letters' }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Please provide a valid email address' }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: { args: [3, 32], msg: 'Password should be 3-32 characters' }
        }
      }
    },
    { 
      sequelize,
      hooks: {
        beforeValidate: (user) => {
          // Make email case insensitive
          if (user.email) {
            user.email = user.email.toLowerCase();
          }
          
          // Ensure first name and last name are valid
          if (user.firstName) {
            user.firstName = user.firstName.trim();
          }
          
          if (user.lastName) {
            user.lastName = user.lastName.trim();
          }
        }
      }
    }
  );
  return User;
};
