const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/**
 * Product Model
 * Represents a food item in the fridge.
 */
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expirationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('IN_FRIDGE', 'AVAILABLE', 'CONSUMED'),
        defaultValue: 'IN_FRIDGE'
    },
    userId: {
        type: DataTypes.INTEGER,
        defaultValue: 1 // Hardcoded for single user demo
    },
    visibility: {
        type: DataTypes.ENUM('public', 'friends', 'groups', 'specific'),
        defaultValue: 'public'
    },
    sharedWith: {
        type: DataTypes.TEXT, // JSON string: { groupIds: [], userIds: [] }
        allowNull: true
    }
});

module.exports = Product;
