const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Dashboard page
router.get('/', auth.verifyToken, (req, res) => {
    res.render('dashboard/index', {
        title: 'Dashboard',
        user: req.user.email
    });
});

// Metrics API (example)
router.get('/metrics', auth.verifyToken, (req, res) => {
    // Here you would fetch and return metrics data
    const metrics = {
        messagesSent: 100,
        uniqueChats: 50,
        activeMenus: 5,
        averageResponseTime: '2s'
    };

    res.json(metrics);
});

module.exports = router;