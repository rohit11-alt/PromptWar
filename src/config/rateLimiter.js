const rateLimit = require('express-rate-limit');

/**
 * Configure API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
        error: "Too many requests from this IP, please try again after 15 minutes."
    }
});

module.exports = apiLimiter;
