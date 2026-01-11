const sequelize = require('../database');
const User = require('./User');
const Product = require('./Product');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Claim = require('./Claim');
const Friendship = require('./Friendship');

/**
 * Model Relationships Setup
 * Defines all associations between models in the database.
 */

// User <-> Product (One-to-Many)
User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// User <-> Group (Many-to-Many through GroupMember)
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId', as: 'groups' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', as: 'members' });

// Group <-> Creator (One-to-Many)
User.hasMany(Group, { foreignKey: 'creatorId', as: 'createdGroups' });
Group.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// Product <-> Claim (One-to-Many)
Product.hasMany(Claim, { foreignKey: 'productId', as: 'claims' });
Claim.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User <-> Claim (One-to-Many)
User.hasMany(Claim, { foreignKey: 'claimerId', as: 'myClaims' });
Claim.belongsTo(User, { foreignKey: 'claimerId', as: 'claimer' });

// User <-> User (Friendship)
User.hasMany(Friendship, { foreignKey: 'requesterId', as: 'sentRequests' });
User.hasMany(Friendship, { foreignKey: 'addresseeId', as: 'receivedRequests' });
Friendship.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
Friendship.belongsTo(User, { foreignKey: 'addresseeId', as: 'addressee' });

/**
 * Sync all models with the database
 * @param {boolean} force - If true, drops existing tables
 */
const syncDatabase = async (force = false) => {
    try {
        // Use alter: true to update tables without dropping them to match model changes
        await sequelize.sync({ force, alter: !force });
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

module.exports = {
    sequelize,
    User,
    Product,
    Group,
    GroupMember,
    Claim,
    Friendship,
    syncDatabase
};
