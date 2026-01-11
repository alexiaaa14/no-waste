const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Social Sharing Routes
 * Integrates with external services for social media sharing.
 * Uses a URL shortener API as the external service requirement.
 */

/**
 * POST /api/social/shorten
 * Shorten a URL using TinyURL API (external service)
 * This demonstrates integration with an external API as required.
 */
router.post('/shorten', async (req, res) => {
    try {
        const { url } = req.body;

        // Use TinyURL API (free, no auth required)
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);

        res.json({
            originalUrl: url,
            shortUrl: response.data,
            service: 'TinyURL'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to shorten URL', details: error.message });
    }
});

/**
 * POST /api/social/share
 * Generate sharing links for various social media platforms
 */
router.post('/share', async (req, res) => {
    try {
        const { productName, productCategory, username } = req.body;

        const message = `Check out this ${productCategory} (${productName}) available for free on No Waste App! Help reduce food waste. 🥗`;
        const appUrl = 'http://localhost:5173'; // Change to deployed URL

        // Shorten the URL first
        let shortUrl = appUrl;
        try {
            const shortenResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(appUrl)}`);
            shortUrl = shortenResponse.data;
        } catch (err) {
            console.log('URL shortening failed, using original URL');
        }

        const shareLinks = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}&quote=${encodeURIComponent(message)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shortUrl)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + shortUrl)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(message)}`,
            email: `mailto:?subject=${encodeURIComponent('Free Food Available!')}&body=${encodeURIComponent(message + '\n\n' + shortUrl)}`,
            instagram: '' // Instagram doesn't support web share link, handled on frontend
        };

        const platform = req.body.platform;
        const shareUrl = platform && shareLinks[platform] ? shareLinks[platform] : '';

        res.json({
            message,
            shortUrl,
            shareLinks,
            shareUrl // Return specific URL for the requested platform
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate share links', details: error.message });
    }
});

/**
 * GET /api/social/stats
 * Get sharing statistics (mock data for demo)
 * In production, this could track actual shares
 */
router.get('/stats', async (req, res) => {
    try {
        // Mock statistics
        const stats = {
            totalShares: Math.floor(Math.random() * 1000) + 100,
            platforms: {
                facebook: Math.floor(Math.random() * 300) + 50,
                twitter: Math.floor(Math.random() * 200) + 30,
                whatsapp: Math.floor(Math.random() * 400) + 80,
                telegram: Math.floor(Math.random() * 100) + 20
            },
            lastUpdated: new Date().toISOString()
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
