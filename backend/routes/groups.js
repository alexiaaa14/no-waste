const express = require('express');
const router = express.Router();
const { Group, GroupMember, User } = require('../models');

/**
 * POST /api/groups
 * Create a new group
 */
router.post('/', async (req, res) => {
    try {
        const { name, description, foodPreferences, creatorId } = req.body;

        const group = await Group.create({
            name,
            description,
            foodPreferences: foodPreferences || '',
            creatorId
        });

        // Add creator as admin member
        await GroupMember.create({
            userId: creatorId,
            groupId: group.id,
            role: 'admin'
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/groups
 * Get all groups (or filter by user)
 */
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;

        if (userId) {
            // Get groups for specific user
            const user = await User.findByPk(userId, {
                include: [{
                    model: Group,
                    as: 'groups',
                    include: [{
                        model: User,
                        as: 'members',
                        attributes: ['id', 'username', 'foodPreferences']
                    }]
                }]
            });
            res.json(user ? user.groups : []);
        } else {
            // Get all groups
            const groups = await Group.findAll({
                include: [{
                    model: User,
                    as: 'members',
                    attributes: ['id', 'username', 'foodPreferences']
                }]
            });
            res.json(groups);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/groups/:id/members
 * Add a member to a group
 */
router.post('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, labels } = req.body;

        const member = await GroupMember.create({
            userId,
            groupId: id,
            role: 'member',
            labels: labels || ''
        });

        res.status(201).json(member);
    } catch (error) {
        console.error('Add member error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'User is already a member of this group' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
        }
        res.status(400).json({ error: error.message });
    }
});

/**
 * PUT /api/groups/:groupId/members/:userId
 * Update member details (labels)
 */
router.put('/:groupId/members/:userId', async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const { labels } = req.body;

        const member = await GroupMember.findOne({
            where: { groupId, userId }
        });

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        member.labels = labels;
        await member.save();

        res.json(member);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/groups/:groupId/members/:userId
 * Remove a member from a group
 */
router.delete('/:groupId/members/:userId', async (req, res) => {
    try {
        const { groupId, userId } = req.params;

        await GroupMember.destroy({
            where: { groupId, userId }
        });

        res.json({ message: 'Member removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/groups/:id
 * Delete a group
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findByPk(id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Delete group members first (cleanup)
        await GroupMember.destroy({
            where: { groupId: id }
        });

        // Delete the group
        await group.destroy();

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
