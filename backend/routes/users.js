const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/users/search
 * Search users by username or email
 */
router.get('/search', async (req, res) => {
    try {
        const { q, excludeId } = req.query;

        if (!q) {
            return res.json([]);
        }

        const where = {
            [Op.or]: [
                { username: { [Op.like]: `%${q}%` } },
                { email: { [Op.like]: `%${q}%` } }
            ]
        };

        if (excludeId) {
            where.id = { [Op.ne]: excludeId };
        }

        const users = await User.findAll({
            where,
            attributes: ['id', 'username', 'email'] // Don't return password
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
