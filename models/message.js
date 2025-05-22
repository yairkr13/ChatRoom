'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Message extends Model {}
  Message.init(
    {
      content: {
        type: DataTypes.STRING,
        allowNull: false
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    },
    { 
      sequelize
    }
  );
  
  Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
  };
  
  return Message;
};
