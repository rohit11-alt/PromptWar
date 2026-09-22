const express = require('express');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const setupSecurity = require('./src/config/security');
const apiLimiter = require('./src/config/rateLimiter');
const scanRoutes = require('./src/routes/scanRoutes');
const logger = require('./src/utils/logger');
const { AppError } = require('./src/utils/errors');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply Security Middleware (Helmet & CORS)
setupSecurity(app);

// Enable Response Compression for high efficiency & fast payload transfers
app.use(compression());

// Response Execution Time Middleware (Benchmark header attached safely before headers sent)
app.use((req, res, next) => {
    const startHighRes = process.hrtime();
    const originalEnd = res.end;
    res.end = function (...args) {
        if (!res.headersSent) {
            const diff = process.hrtime(startHighRes);
            const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
            res.setHeader('X-Response-Time', `${durationMs}ms`);
        }
        return originalEnd.apply(this, args);
    };
    next();
});

// Request body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting on API routes
app.use('/api/', apiLimiter);

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true
}));

// Mount API Routes
app.use('/api', scanRoutes);

// SPA Fallback Route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized Error Handling Architecture
app.use((err, req, res, _next) => {
    logger.error("Unhandled Application Error", { error: err.message, stack: err.stack });

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "Uploaded document size exceeds the 5MB maximum limit." });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    res.status(500).json({ error: "An unexpected server error occurred. Please try again." });
});

// Export app instance for automated testing
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`SentinelOffer AI Server running on port ${PORT}`);
    });
}

module.exports = app;