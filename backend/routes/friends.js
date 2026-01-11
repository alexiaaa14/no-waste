const express = require('express');
const router = express.Router();
const { User, Friendship, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/friends
 * Get all accepted friends for a user
 */
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;

        // Find all friendships where the user is either sender or receiver, and status is accepted
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { requesterId: userId },
                    { addresseeId: userId }
                ],
                status: 'accepted'
            },
            include: [
                { model: User, as: 'requester', attributes: ['id', 'username', 'email'] },
                { model: User, as: 'addressee', attributes: ['id', 'username', 'email'] }
            ]
        });

        // Format the result to return the list of friend users
        const friends = friendships.map(f => {
            if (f.requesterId == userId) return f.addressee;
            return f.requester;
        });

        res.json(friends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/friends/requests
 * Get all pending requests for a user (both sent and received)
 */
router.get('/requests', async (req, res) => {
    try {
        const { userId } = req.query;

        const sent = await Friendship.findAll({
            where: { requesterId: userId, status: 'pending' },
            include: [{ model: User, as: 'addressee', attributes: ['id', 'username', 'email'] }]
        });

        const received = await Friendship.findAll({
            where: { addresseeId: userId, status: 'pending' },
            include: [{ model: User, as: 'requester', attributes: ['id', 'username', 'email'] }]
        });

        res.json({ sent, received });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/friends/request
 * Send a friend request
 */
router.post('/request', async (req, res) => {
    try {
        const { requesterId, addresseeId } = req.body;

        if (requesterId == addresseeId) {
            return res.status(400).json({ error: "Cannot add yourself as a friend" });
        }

        // Check if friendship already exists
        const existing = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requesterId, addresseeId },
                    { requesterId: addresseeId, addresseeId: requesterId }
                ]
            }
        });

        if (existing) {
            if (existing.status === 'accepted') {
                return res.status(400).json({ error: "Already friends" });
            } else if (existing.status === 'pending') {
                return res.status(400).json({ error: "Request already pending" });
            } else {
                // If previously rejected, we might allow re-requesting.
                // For now, let's just update to pending.
                existing.status = 'pending';
                existing.requesterId = requesterId; // ensure the new requester is set
                existing.addresseeId = addresseeId;
                await existing.save();
                return res.json(existing);
            }
        }

        const newRequest = await Friendship.create({
            requesterId,
            addresseeId,
            status: 'pending'
        });

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/friends/:requestId/accept
 * Accept a friend request
 */
router.put('/:requestId/accept', async (req, res) => {
    try {
        const { requestId } = req.params;
        const friendship = await Friendship.findByPk(requestId);

        if (!friendship) {
            return res.status(404).json({ error: "Request not found" });
        }

        friendship.status = 'accepted';
        await friendship.save();

        res.json(friendship);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/friends/:requestId
 * Reject or Cancel a friend request, or Unfriend
 */
router.delete('/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const friendship = await Friendship.findByPk(requestId);

        if (!friendship) {
            return res.status(404).json({ error: "Request/Friendship not found" });
        }

        await friendship.destroy();
        res.json({ message: "Removed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
