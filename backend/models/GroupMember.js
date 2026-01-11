const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/**
 * GroupMember Model
 * Junction table for many-to-many relationship between Users and Groups.
 * Tracks which users belong to which groups.
 */
const GroupMember = sequelize.define('GroupMember', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Groups',
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'member'),
        defaultValue: 'member'
    },
    labels: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: true
    }
});

module.exports = GroupMember;
