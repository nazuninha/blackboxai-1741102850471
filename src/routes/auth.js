const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Generate CSRF token
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Login page
router.get('/login', auth.checkNotAuthenticated, (req, res) => {
    const csrfToken = generateCSRFToken();
    res.cookie('csrfToken', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.render('auth/login', {
        title: 'Login',
        csrfToken,
        error: null
    });
});

// Login handler
router.post('/login', auth.loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).render('auth/login', {
                title: 'Login',
                error: 'Please provide both email and password',
                csrfToken: req.cookies.csrfToken
            });
        }

        // Check credentials against environment variables
        if (email !== process.env.ADMIN_EMAIL) {
            logger.warn(`Failed login attempt for email: ${email} from IP: ${req.ip}`);
            req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
            
            return res.status(401).render('auth/login', {
                title: 'Login',
                error: 'Invalid credentials',
                csrfToken: req.cookies.csrfToken
            });
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, await bcrypt.hash(process.env.ADMIN_PASSWORD, 10));
        
        if (!isValidPassword) {
            logger.warn(`Failed login attempt for email: ${email} from IP: ${req.ip}`);
            req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
            
            return res.status(401).render('auth/login', {
                title: 'Login',
                error: 'Invalid credentials',
                csrfToken: req.cookies.csrfToken
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: process.env.ADMIN_EMAIL },
            process.env.JWT_SECRET,
            { expiresIn: process.env.SESSION_TIMEOUT }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: parseInt(process.env.SESSION_TIMEOUT)
        });

        // Reset login attempts on successful login
        req.session.loginAttempts = 0;
        req.session.lockUntil = null;

        logger.info(`Successful login for email: ${email} from IP: ${req.ip}`);
        res.redirect('/dashboard');
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).render('auth/login', {
            title: 'Login',
            error: 'An error occurred during login',
            csrfToken: req.cookies.csrfToken
        });
    }
});

// Logout handler
router.get('/logout', auth.verifyToken, (req, res) => {
    try {
        res.clearCookie('token');
        res.clearCookie('csrfToken');
        logger.info(`User logged out: ${req.user.email}`);
        res.redirect('/login');
    } catch (error) {
        logger.error(`Logout error: ${error.message}`);
        res.redirect('/dashboard');
    }
});

module.exports = router;