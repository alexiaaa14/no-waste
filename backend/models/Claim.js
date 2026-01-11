const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/**
 * Claim Model
 * Represents a claim made by a user on an available product.
 * Allows users to claim products shared by others.
 */
const Claim = sequelize.define('Claim', {
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'id'
        }
    },
    claimerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
        defaultValue: 'pending'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Optional message from claimer to product owner'
    }
});

module.exports = Claim;
