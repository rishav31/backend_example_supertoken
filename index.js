const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const os = require('os');
require('dotenv').config();

const { initSuperTokens } = require('./config/supertokens');
const { middleware, errorHandler } = require('supertokens-node/framework/express');
const supertokens = require('supertokens-node');

// Routes
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const publicRoutes = require('./routes/public');
const passwordlessRoutes = require('./routes/passwordless');

// Function to get current network IP address
function getNetworkIP() {
    const interfaces = os.networkInterfaces();
    
    // Look for the first non-internal IPv4 address
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    
    return 'localhost'; // Fallback if no network IP found
}

// Get dynamic IP and update environment
const NETWORK_IP = getNetworkIP();
const PORT = process.env.PORT || 8080;

// Dynamically set API domain and allowed origins
process.env.API_DOMAIN = `http://${NETWORK_IP}:${PORT}`;

// Create dynamic CORS origins including current IP
const staticOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000'];

const dynamicOrigins = [
    `http://${NETWORK_IP}:3000`,
    `http://${NETWORK_IP}:3001`,
    `http://${NETWORK_IP}:3002`,
    `http://${NETWORK_IP}:3003`
];

const allowedOrigins = [...staticOrigins, ...dynamicOrigins];

console.log('🌐 Network Configuration:');
console.log(`   Current IP: ${NETWORK_IP}`);
console.log(`   API Domain: ${process.env.API_DOMAIN}`);
console.log(`   Allowed CORS Origins:`);
allowedOrigins.forEach(origin => console.log(`     - ${origin}`));

// Initialize SuperTokens with dynamic configuration
initSuperTokens();

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration using the dynamic allowedOrigins array
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
}));

// Request timeout middleware - increased for SuperTokens frontend
app.use((req, res, next) => {
    const timeout = parseInt(process.env.REQUEST_TIMEOUT) || 60000; // 60 seconds
    
    // Set timeout for requests
    req.setTimeout(timeout, () => {
        console.log(`⏰ Request timeout occurred for: ${req.method} ${req.url} (${timeout}ms)`);
        console.log(`   User-Agent: ${req.get('User-Agent') || 'Unknown'}`);
        console.log(`   Origin: ${req.get('Origin') || 'Unknown'}`);
        if (!res.headersSent) {
            res.status(408).json({
                error: 'Request Timeout',
                message: `Request took longer than ${timeout}ms to process`,
                timestamp: new Date().toISOString(),
                url: req.url,
                method: req.method
            });
        }
    });
    
    // Set response timeout  
    res.setTimeout(timeout, () => {
        console.log(`⏰ Response timeout occurred for: ${req.method} ${req.url} (${timeout}ms)`);
    });
    
    next();
});

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// SuperTokens middleware
app.use(middleware());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'SuperTokens Node Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// SuperTokens frontend debug endpoint
app.get('/debug/supertokens', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'SuperTokens backend ready for frontend',
        configuration: {
            apiDomain: process.env.API_DOMAIN || `http://localhost:${process.env.PORT || 8080}`,
            websiteDomain: process.env.APP_WEBSITE_URL || "http://localhost:3000",
            apiBasePath: "/auth",
            cors: {
                allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000']
            }
        },
        headers: req.headers,
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/public', publicRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/passwordless', passwordlessRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString()
    });
});

// SuperTokens error handler
app.use(errorHandler());

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Don't expose error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 SuperTokens Node Backend running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth`);
        console.log(`📁 API endpoints: http://localhost:${PORT}/api`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Network access: http://${NETWORK_IP}:${PORT}`);
    });

    // Configure server timeouts - increased for SuperTokens frontend
    const serverTimeout = parseInt(process.env.SERVER_TIMEOUT) || 60000; // 60 seconds
    const keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT) || 120000; // 120 seconds
    
    server.timeout = serverTimeout;
    server.keepAliveTimeout = keepAliveTimeout;  
    server.headersTimeout = keepAliveTimeout + 1000; // slightly higher than keepAlive

    console.log(`⏱️  Server timeout: ${serverTimeout}ms`);
    console.log(`⏱️  Keep-alive timeout: ${keepAliveTimeout}ms`);

    // Enhanced connection logging for debugging
    server.on('connection', (socket) => {
        const remoteAddress = socket.remoteAddress;
        const remotePort = socket.remotePort;
        console.log(`🔌 New connection: ${remoteAddress}:${remotePort}`);
        
        socket.on('error', (err) => {
            console.error(`🚨 Socket error from ${remoteAddress}:${remotePort}:`, err.message);
        });
        
        socket.on('timeout', () => {
            console.log(`⏰ Socket timeout from ${remoteAddress}:${remotePort}`);
        });
        
        socket.on('close', (hadError) => {
            console.log(`🔌 Connection closed ${remoteAddress}:${remotePort} ${hadError ? '(with error)' : '(clean)'}`);
        });
    });

    server.on('timeout', () => {
        console.log('⏰ Server timeout occurred');
    });
}

module.exports = app;
