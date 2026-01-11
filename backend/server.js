const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { syncDatabase, Product, User } = require('./models');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

/**
 * Import route modules
 */
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const claimRoutes = require('./routes/claims');
const socialRoutes = require('./routes/social');
const friendRoutes = require('./routes/friends');
const userRoutes = require('./routes/users');

/**
 * Mount routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/users', userRoutes);

/**
 * Syncs the database models with the database.
 */
syncDatabase().then(() => {
    console.log('Database synced');
});

/**
 * GET /products
 * Retrieves all products from the database.
 * Can filter by userId or status.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const { Op } = require('sequelize'); // Make sure Op is available
const { Friendship, GroupMember } = require('./models');

/**
 * GET /products
 * Retrieves products with visibility filtering.
 */
app.get('/products', async (req, res) => {
    try {
        const { userId, status, viewerId } = req.query;
        const where = {};

        if (userId) where.userId = userId;
        if (status) where.status = status;

        const products = await Product.findAll({
            where,
            include: [{
                model: User,
                as: 'owner',
                attributes: ['id', 'username', 'email']
            }],
            order: [['expirationDate', 'ASC']]
        });

        // If no viewerId provided, return all (backward compatibility or admin view)
        // If searching for my own products (userId=X), return all.
        if (!viewerId || userId == viewerId) {
            return res.json(products);
        }

        // --- Visibility Filtering Logic ---

        // 1. Get Viewer's Friend IDs
        const friendships = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [{ requesterId: viewerId }, { addresseeId: viewerId }]
            }
        });
        const friendIds = friendships.map(f =>
            f.requesterId == viewerId ? f.addresseeId : f.requesterId
        );

        // 2. Get Viewer's Group IDs
        const groupMemberships = await GroupMember.findAll({
            where: { userId: viewerId }
        });
        const myGroupIds = groupMemberships.map(gm => gm.groupId);

        // 3. Filter Products
        const visibleProducts = products.filter(product => {
            // Owner always sees their own
            if (product.userId == viewerId) return true;

            const { visibility, sharedWith } = product;

            // Legacy/Default: if no visibility set, assume public/all friends (depending on desired default)
            // User asked for specific control. Let's assume 'public' is truly public for now.
            if (!visibility || visibility === 'public') return true;

            if (visibility === 'friends') {
                return friendIds.includes(product.userId);
            }

            let sharedData = { groupIds: [], userIds: [] };
            try {
                if (sharedWith) sharedData = JSON.parse(sharedWith);
            } catch (e) { /* ignore parse error */ }

            if (visibility === 'groups') {
                // Visible if product is shared with a group I am in
                return sharedData.groupIds?.some(gid => myGroupIds.includes(gid));
            }

            if (visibility === 'specific') {
                // Visible if product is shared specifically with me
                return sharedData.userIds?.includes(parseInt(viewerId));
            }

            return false;
        });

        res.json(visibleProducts);
    } catch (error) {
        console.error('GET /products error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /products (unchanged, simplified for context)
 */
app.post('/products', async (req, res) => {
    try {
        const { name, category, expirationDate, userId } = req.body;
        const product = await Product.create({
            name,
            category,
            expirationDate,
            userId: userId || 1
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /products/:id
 * Updates status and visibility.
 */
app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, visibility, sharedWith } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (status) product.status = status;
        if (visibility) product.visibility = visibility;
        if (sharedWith) product.sharedWith = typeof sharedWith === 'object' ? JSON.stringify(sharedWith) : sharedWith;

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('PUT /products error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /products/:id
 * Deletes a product by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /notifications
 * Get notifications for expiring products
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/notifications', async (req, res) => {
    try {
        const { userId } = req.query;
        const where = { status: 'IN_FRIDGE' };
        if (userId) where.userId = userId;

        const products = await Product.findAll({ where });

        const notifications = products.filter(product => {
            const today = new Date();
            const expDate = new Date(product.expirationDate);
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 3 && diffDays >= 0;
        }).map(product => ({
            id: product.id,
            message: `${product.name} expires in ${Math.ceil((new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))} days!`,
            product: product,
            type: 'expiring',
            createdAt: new Date()
        }));

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints available:`);
    console.log(`  - Products: http://localhost:${PORT}/products`);
    console.log(`  - Auth: http://localhost:${PORT}/api/auth/*`);
    console.log(`  - Groups: http://localhost:${PORT}/api/groups/*`);
    console.log(`  - Claims: http://localhost:${PORT}/api/claims/*`);
    console.log(`  - Social: http://localhost:${PORT}/api/social/*`);
    console.log(`  - Notifications: http://localhost:${PORT}/notifications`);
});
