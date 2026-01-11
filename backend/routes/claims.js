const express = require('express');
const router = express.Router();
const { Claim, Product, User } = require('../models');

/**
 * POST /api/claims
 * Create a new claim on a product
 */
router.post('/', async (req, res) => {
    try {
        const { productId, claimerId, message } = req.body;

        // Check if product is available
        const product = await Product.findByPk(productId);
        if (!product || product.status !== 'AVAILABLE') {
            return res.status(400).json({ error: 'Product not available for claiming' });
        }

        // Check if user already claimed this product
        const existingClaim = await Claim.findOne({
            where: { productId, claimerId }
        });

        if (existingClaim) {
            return res.status(400).json({ error: 'You already claimed this product' });
        }

        const claim = await Claim.create({
            productId,
            claimerId,
            message: message || '',
            status: 'pending'
        });

        res.status(201).json(claim);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/claims
 * Get claims (filter by user or product)
 */
router.get('/', async (req, res) => {
    try {
        const { userId, productId } = req.query;
        const where = {};

        if (userId) where.claimerId = userId;
        if (productId) where.productId = productId;

        const claims = await Claim.findAll({
            where,
            include: [
                {
                    model: Product,
                    as: 'product',
                    include: [{
                        model: User,
                        as: 'owner',
                        attributes: ['id', 'username', 'email']
                    }]
                },
                {
                    model: User,
                    as: 'claimer',
                    attributes: ['id', 'username', 'email']
                }
            ]
        });

        res.json(claims);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/claims/:id
 * Update claim status (accept/reject)
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const claim = await Claim.findByPk(id);
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        claim.status = status;
        await claim.save();

        // If accepted, transfer ownership
        if (status.toUpperCase() === 'ACCEPTED') {
            const product = await Product.findByPk(claim.productId);
            if (product) {
                // Transfer to claimer
                product.userId = claim.claimerId;
                product.status = 'IN_FRIDGE';
                product.visibility = 'public';
                product.sharedWith = null;
                await product.save();

                // Reject all other pending claims for this product
                const { Op } = require('sequelize');
                await Claim.update(
                    { status: 'REJECTED' },
                    {
                        where: {
                            productId: claim.productId,
                            id: { [Op.ne]: claim.id },
                            status: 'PENDING'
                        }
                    }
                );
            }
        }

        res.json(claim);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
