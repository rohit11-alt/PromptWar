const express = require('express');
const path = require('path');
require('dotenv').config();

const setupSecurity = require('./src/config/security');
const apiLimiter = require('./src/config/rateLimiter');
const scanRoutes = require('./src/routes/scanRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply Security Middleware (Helmet & CORS)
setupSecurity(app);

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting on API routes
app.use('/api/', apiLimiter);

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes
app.use('/api', scanRoutes);

// Catch-all route for single-page app fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "Uploaded file size exceeds the 5MB limit." });
    }
    res.status(500).json({ error: "An unexpected server error occurred." });
});

// Export app instance for automated testing with Supertest
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`SentinelOffer AI Server running on port ${PORT}`);
    });
}

module.exports = app;