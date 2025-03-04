const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = {
    // Verify JWT token middleware
    verifyToken: (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            logger.warn(`Unauthorized access attempt from IP: ${req.ip}`);
            return res.redirect('/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            logger.error(`Invalid token from IP: ${req.ip}`);
            res.clearCookie('token');
            return res.redirect('/login');
        }
    },

    // Rate limiting for login attempts
    loginLimiter: (req, res, next) => {
        if (!req.session) {
            req.session = {};
        }
        
        if (!req.session.loginAttempts) {
            req.session.loginAttempts = 0;
        }

        if (req.session.loginAttempts >= 5) {
            if (!req.session.lockUntil) {
                req.session.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
            }

            if (Date.now() < req.session.lockUntil) {
                logger.warn(`Blocked login attempt from IP: ${req.ip} - too many attempts`);
                return res.status(429).json({
                    error: 'Too many login attempts. Please try again later.'
                });
            }

            // Reset on lock expiration
            req.session.loginAttempts = 0;
            req.session.lockUntil = null;
        }

        next();
    },

    // CSRF Token validation
    validateCSRF: (req, res, next) => {
        const csrfToken = req.cookies.csrfToken;
        const headerToken = req.headers['x-csrf-token'];

        if (!csrfToken || !headerToken || csrfToken !== headerToken) {
            logger.warn(`CSRF token validation failed from IP: ${req.ip}`);
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }

        next();
    },

    // Check if user is already logged in
    checkNotAuthenticated: (req, res, next) => {
        const token = req.cookies.token;
        
        if (token) {
            try {
                jwt.verify(token, process.env.JWT_SECRET);
                return res.redirect('/dashboard');
            } catch (err) {
                res.clearCookie('token');
            }
        }
        
        next();
    }
};

module.exports = auth;