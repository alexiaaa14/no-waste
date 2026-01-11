const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, foodPreferences } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            foodPreferences: foodPreferences || ''
        });

        // Don't send password back
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            foodPreferences: user.foodPreferences
        };

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/auth/login
 * Login user (simplified - no JWT for demo)
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return user data (in production, use JWT)
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            foodPreferences: user.foodPreferences
        };

        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/auth/:id
 * Delete user account and all associated data
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { Product, GroupMember, Friendship, Claim } = require('../models');
        const { Op } = require('sequelize');

        // Cleanup associated data
        await Product.destroy({ where: { userId: id } });
        await GroupMember.destroy({ where: { userId: id } });
        await Friendship.destroy({
            where: {
                [Op.or]: [{ requesterId: id }, { addresseeId: id }]
            }
        });
        await Claim.destroy({ where: { claimerId: id } });

        // Delete user
        await user.destroy();

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/auth/users
 * Get all users (for finding friends)
 */
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'foodPreferences']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
