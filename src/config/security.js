const helmet = require('helmet');
const cors = require('cors');

/**
 * Configure Helmet security headers and CORS policy
 * @param {import('express').Application} app
 */
function setupSecurity(app) {
    // Basic Helmet setup
    app.use(helmet({
        contentSecurityPolicy: false, // Allows inline scripts for simplicity in static SPA
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS configuration
    app.use(cors({
        origin: '*', // Allow connections for demo & hackathon evaluation
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
}

module.exports = setupSecurity;
