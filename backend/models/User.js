const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/**
 * User Model
 * Represents a user in the Anti Food Waste App.
 * Users can have products, belong to groups, and claim products from others.
 */
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    foodPreferences: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Comma-separated list of preferences (e.g., "Vegetarian,Vegan,Gluten-Free")'
    }
});

module.exports = User;
