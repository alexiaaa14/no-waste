const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/**
 * Group Model
 * Represents a friend group with specific food preferences.
 * Users can create groups and invite friends to share available products.
 */
const Group = sequelize.define('Group', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    foodPreferences: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Group food preferences (e.g., "Vegetarian,Organic")'
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

module.exports = Group;
