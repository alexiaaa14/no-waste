const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/**
 * Friendship Model
 * Represents a friendship link between two users.
 * Has a status: 'pending', 'accepted', 'rejected'.
 */
const Friendship = sequelize.define('Friendship', {
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
    }
});

module.exports = Friendship;
