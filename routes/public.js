const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/public/hello
 * @desc    Public hello endpoint
 * @access  Public
 */
router.get('/hello', (req, res) => {
    res.json({
        message: 'Hello from SuperTokens Node Backend!',
        description: 'This is a public endpoint that doesn\'t require authentication',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * @route   GET /api/public/info
 * @desc    Get public application information
 * @access  Public
 */
router.get('/info', (req, res) => {
    res.json({
        appName: process.env.APP_NAME || 'SuperTokens Node Backend',
        version: '1.0.0',
        description: 'A Node.js Express backend with SuperTokens authentication',
        environment: process.env.NODE_ENV || 'development',
        features: [
            'Email/Password Authentication',
            'Session Management',
            'CORS Configuration',
            'Security Headers',
            'Request Logging',
            'Error Handling'
        ],
        endpoints: {
            auth: '/auth',
            public: '/api/public',
            protected: '/api/protected',
            health: '/health'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * @route   GET /api/public/status
 * @desc    Get service status
 * @access  Public
 */
router.get('/status', (req, res) => {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    res.json({
        status: 'healthy',
        uptime: {
            seconds: uptime,
            formatted: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
            unit: 'MB'
        },
        nodejs: process.version,
        platform: process.platform,
        timestamp: new Date().toISOString()
    });
});

/**
 * @route   POST /api/public/contact
 * @desc    Handle contact form submissions (demo)
 * @access  Public
 */
router.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'Name, email, and message are required'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Invalid email',
            message: 'Please provide a valid email address'
        });
    }

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Queue for processing, etc.

    res.json({
        message: 'Contact form submitted successfully',
        data: {
            name,
            email,
            messageLength: message.length,
            submittedAt: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9) // Demo ID
        }
    });
});

module.exports = router;
