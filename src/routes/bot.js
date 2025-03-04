const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const whatsappController = require('../controllers/whatsappController');

// Bot management page
router.get('/', auth.verifyToken, (req, res) => {
    res.render('bot/index', {
        title: 'Bot Management',
        user: req.user.email
    });
});

// Connect new number
router.post('/connect', auth.verifyToken, async (req, res) => {
    const { number } = req.body;
    try {
        const sock = await whatsappController.connectWhatsApp(number);
        res.status(200).json({ message: 'Number connected successfully!', number });
    } catch (error) {
        logger.error(`Failed to connect number: ${error.message}`);
        res.status(500).json({ error: 'Failed to connect number' });
    }
});

// Disconnect number
router.post('/disconnect', auth.verifyToken, async (req, res) => {
    const { number } = req.body;
    try {
        const success = await whatsappController.disconnectWhatsApp(number);
        if (success) {
            res.status(200).json({ message: 'Number disconnected successfully!' });
        } else {
            res.status(404).json({ error: 'Number not found' });
        }
    } catch (error) {
        logger.error(`Failed to disconnect number: ${error.message}`);
        res.status(500).json({ error: 'Failed to disconnect number' });
    }
});

module.exports = router;